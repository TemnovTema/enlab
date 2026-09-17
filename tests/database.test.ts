import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { schedule } from "../lib/domain";
test("SQL ownership, atomic reviews, retries, stale writes and deletion history", async () => {
  const db = new PGlite();
  await db.exec(
    `create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid,name text,bucket_id text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert,update,delete on storage.objects to authenticated;create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;`,
  );
  await db.exec(readFileSync("supabase/migrations/001_initial.sql", "utf8"));
  await db.exec(readFileSync("supabase/migrations/002_practice.sql", "utf8"));
  const alice = "11111111-1111-4111-8111-111111111111",
    bob = "22222222-2222-4222-8222-222222222222";
  await db.exec(
    `insert into auth.users values('${alice}'),('${bob}');set role authenticated;set request.jwt.claim.sub='${alice}';`,
  );
  const expression = await db.query<{ id: string }>(
    `select save_expression(null,'take part','участвовать','I take part.','',null,'','','I ［ … ］.') as id`,
  );
  const eid = expression.rows[0].id;
  const mid = "77777777-7777-4777-8777-777777777777";
  await db.query(
    "insert into materials(id,title,path,kind) values($1,$2,$3,$4)",
    [mid, "book", alice + "/book.pdf", "pdf"],
  );
  await db.query(
    "insert into fragments(material_id,page,text) values($1,1,$2)",
    [mid, "Example context"],
  );
  await db.query(
    "insert into storage.objects(id,name,bucket_id) values($1,$2,$3)",
    [mid, alice + "/book.pdf", "originals"],
  );

  const cards = await db.query<{ id: string }>("select id from cards");
  assert.equal(cards.rows.length, 2);
  const card = cards.rows[0].id,
    review = "33333333-3333-4333-8333-333333333333",
    state = JSON.stringify(schedule(null, 3));
  await assert.rejects(
    db.query(
      `insert into reviews(id,card_id,rating,after_state) values($1,$2,3,$3)`,
      [review, card, state],
    ),
    /permission denied/,
  );
  const save = () =>
    db.query("select commit_review($1,$2,0,3,$3)", [review, card, state]);
  await save();
  await save();
  assert.equal((await db.query("select * from reviews")).rows.length, 1);
  assert.equal(
    (
      await db.query<{ version: number }>(
        "select version from cards where id=$1",
        [card],
      )
    ).rows[0].version,
    1,
  );
  await assert.rejects(
    db.query("select commit_review($1,$2,0,4,$3)", [review, card, state]),
    /Idempotency/,
  );
  await assert.rejects(
    db.query("select commit_review($1,$2,0,3,$3)", [
      "44444444-4444-4444-8444-444444444444",
      card,
      state,
    ]),
    /STALE_CARD/,
  );
  const aid = "99999999-9999-4999-8999-999999999999";
  const saveAttempt = () =>
    db.query(
      "insert into practice_attempts(id,test_id,test_version,answers,result) values($1,'reading-green-campus',1,'{}','{\"score\":0}') on conflict(id) do nothing",
      [aid],
    );
  await saveAttempt();
  await saveAttempt();
  assert.equal(
    (await db.query("select * from practice_attempts")).rows.length,
    1,
  );
  await assert.rejects(
    db.query("update practice_attempts set result='{}' where id=$1", [aid]),
    /permission denied/,
  );
  await db.exec(`set request.jwt.claim.sub='${bob}'`);
  for (const table of [
    "expressions",
    "cards",
    "reviews",
    "materials",
    "fragments",
    "storage.objects",
    "practice_attempts",
  ])
    assert.equal((await db.query(`select * from ${table}`)).rows.length, 0);
  await assert.rejects(
    db.query(
      "insert into practice_attempts(id,user_id,test_id,test_version,answers,result) values(gen_random_uuid(),$1,'reading-green-campus',1,'{}','{}')",
      [alice],
    ),
    /row-level security/,
  );
  await assert.rejects(
    db.query("insert into fragments(material_id,page,text) values($1,2,$2)", [
      mid,
      "Foreign",
    ]),
    /foreign key/,
  );
  await assert.rejects(
    db.query(
      "insert into storage.objects(id,name,bucket_id) values($1,$2,$3)",
      [mid, alice + "/attack.pdf", "originals"],
    ),
    /row-level security/,
  );
  await assert.rejects(
    db.query("select commit_review($1,$2,1,3,$3)", [
      "55555555-5555-4555-8555-555555555555",
      card,
      state,
    ]),
    /Card not found/,
  );
  await assert.rejects(
    db.query(`select save_expression($1,'hacked','x','x','',null,'','',null)`, [
      eid,
    ]),
    /Not found/,
  );
  await db.exec(`set request.jwt.claim.sub='${alice}'`);
  await db.query("delete from expressions where id=$1", [eid]);
  assert.equal((await db.query("select * from cards")).rows.length, 0);
  assert.equal((await db.query("select * from reviews")).rows.length, 1);
  await db.close();
});
