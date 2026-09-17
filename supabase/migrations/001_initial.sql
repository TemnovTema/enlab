create table public.materials (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
 title text not null, path text not null, kind text not null check(kind in ('pdf','txt')),
 status text not null default 'pending' check(status in ('pending','processing','ready','error')),
 error text, processed_pages integer not null default 0, total_pages integer, position integer not null default 0 check(position>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.fragments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
 material_id uuid not null, page integer not null, text text not null,
 foreign key(material_id,user_id) references public.materials(id,user_id) on delete cascade, unique(material_id,page)
);
create table public.expressions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
 phrase text not null check(length(trim(phrase)) between 1 and 200), meaning text not null check(length(trim(meaning)) between 1 and 2000),
 example text not null check(length(trim(example)) between 1 and 4000), own_example text not null default '',
 material_id uuid, source text not null default '', context text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
 foreign key(material_id,user_id) references public.materials(id,user_id)
);
create table public.cards (
 id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
 expression_id uuid not null, kind text not null check(kind in ('recognition','recall')), prompt text,
 schedule jsonb, due timestamptz not null default now(), version integer not null default 0,
 foreign key(expression_id,user_id) references public.expressions(id,user_id) on delete cascade,
 unique(expression_id,kind), unique(id,user_id)
);
create table public.reviews (
 id uuid primary key, user_id uuid not null default auth.uid() references auth.users on delete cascade,
 card_id uuid, expression_id uuid, rating integer not null check(rating between 1 and 4),
 reviewed_at timestamptz not null default now(), before_state jsonb, after_state jsonb not null,
 unique(card_id,reviewed_at)
);
-- History deliberately survives deleting an expression/card.
create index cards_due on public.cards(user_id,due);
create index reviews_user_date on public.reviews(user_id,reviewed_at);
create index expressions_user on public.expressions(user_id);
create index materials_user on public.materials(user_id);
do $$ declare t text; begin
 foreach t in array array['materials','fragments','expressions','cards','reviews'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy owner on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',t);
 execute format('grant select, insert, update, delete on public.%I to authenticated',t);
 end loop;
end $$;
revoke insert, update, delete on public.cards, public.reviews from authenticated;
create function public.save_expression(p_id uuid,p_phrase text,p_meaning text,p_example text,p_own text,p_material uuid,p_source text,p_context text,p_cloze text)
returns uuid language plpgsql security definer set search_path=public as $$
declare eid uuid; begin
 if auth.uid() is null then raise exception 'Unauthorized'; end if;
 if p_id is not null then
 update expressions set phrase=p_phrase,meaning=p_meaning,example=p_example,own_example=p_own,source=p_source,updated_at=now() where id=p_id and user_id=auth.uid() returning id into eid;
 if eid is null then raise exception 'Not found'; end if;
 else
 insert into expressions(phrase,meaning,example,own_example,material_id,source,context) values(p_phrase,p_meaning,p_example,p_own,p_material,p_source,p_context) returning id into eid;
 end if;
 insert into cards(expression_id,kind) values(eid,'recognition') on conflict(expression_id,kind) do nothing;
 if p_cloze is not null then
 insert into cards(expression_id,kind,prompt) values(eid,'recall',p_cloze) on conflict(expression_id,kind) do update set prompt=excluded.prompt;
 else delete from cards where expression_id=eid and kind='recall' and user_id=auth.uid(); end if;
 return eid; end $$;
create function public.commit_review(p_id uuid,p_card uuid,p_version integer,p_rating integer,p_schedule jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c cards; r reviews; begin
 if auth.uid() is null then raise exception 'Unauthorized'; end if;
 select * into c from cards where id=p_card and user_id=auth.uid() for update;
 if not found then raise exception 'Card not found'; end if;
 select * into r from reviews where id=p_id and user_id=auth.uid();
 if found then
 if r.card_id<>p_card or r.rating<>p_rating then raise exception 'Idempotency key conflict'; end if;
 return to_jsonb(r); end if;
 if c.version<>p_version then raise exception 'STALE_CARD: refresh session'; end if;
 if p_rating not between 1 and 4 or p_schedule->>'due' is null then raise exception 'Invalid review'; end if;
 insert into reviews(id,card_id,expression_id,rating,before_state,after_state) values(p_id,c.id,c.expression_id,p_rating,c.schedule,p_schedule) returning * into r;
 update cards set schedule=p_schedule,due=(p_schedule->>'due')::timestamptz,version=version+1 where id=c.id;
 return to_jsonb(r); end $$;
revoke all on function public.save_expression(uuid,text,text,text,text,uuid,text,text,text) from public;
revoke all on function public.commit_review(uuid,uuid,integer,integer,jsonb) from public;
grant execute on function public.save_expression(uuid,text,text,text,text,uuid,text,text,text) to authenticated;
grant execute on function public.commit_review(uuid,uuid,integer,integer,jsonb) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('originals','originals',false,10485760,array['application/pdf','text/plain']);
create policy own_files on storage.objects for all to authenticated using(bucket_id='originals' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='originals' and (storage.foldername(name))[1]=auth.uid()::text);
