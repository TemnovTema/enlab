// macOS authoring helper; deployed app only needs the checked-in M4A files.
import { practiceTests } from "../lib/course/tests";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const temp = mkdtempSync(join(tmpdir(), "fieldnotes-audio-"));
try {
  for (const test of practiceTests.filter((t) => t.skill === "listening")) {
    const txt = join(temp, test.id + ".txt"),
      aiff = join(temp, test.id + ".aiff");
    writeFileSync(txt, test.transcript!);
    execFileSync("/usr/bin/say", [
      "-v",
      "Daniel",
      "-r",
      "155",
      "-f",
      txt,
      "-o",
      aiff,
    ]);
    execFileSync("/usr/bin/afconvert", [
      "-f",
      "m4af",
      "-d",
      "aac@44100",
      aiff,
      "public" + test.audio,
    ]);
    console.log("Created", test.audio);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
