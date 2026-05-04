// Apply schema + seed sample decks to a fresh Neon Postgres database.
// Usage: DATABASE_URL=postgresql://... node scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}
const sql = neon(url);

console.log("Applying schema...");
const schema = fs.readFileSync(path.join(__dirname, "..", "lib", "schema.sql"), "utf8");
const stmts = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith("--"));
for (const stmt of stmts) {
  await sql.query(stmt);
}
console.log("Schema applied.");

const SAMPLES = [
  {
    title: "JavaScript essentials",
    description: "Core JS concepts every web developer should know cold.",
    emoji: "🟨",
    color: "amber",
    cards: [
      ["What is the difference between `let` and `var`?", "`let` is block-scoped and not hoisted to the top of its scope (it lives in the temporal dead zone). `var` is function-scoped and hoisted, initialised to `undefined`."],
      ["What does `===` do that `==` doesn't?", "`===` compares both type and value with no coercion. `==` performs type coercion before comparing, so `0 == '0'` is true while `0 === '0'` is false."],
      ["What is a closure?", "A closure is a function that retains access to the variables from the scope in which it was created, even after that scope has finished executing."],
      ["What does `Array.prototype.map` return?", "A new array of the same length, where each element is the result of calling the callback on the corresponding element of the original. It does not mutate the original."],
      ["What is the event loop?", "The runtime mechanism that pulls tasks off the macrotask and microtask queues and runs them on the call stack, allowing JS to handle async operations on a single thread."],
      ["What is `Promise.all` vs `Promise.allSettled`?", "`Promise.all` resolves with all results or rejects on the first failure. `Promise.allSettled` always resolves, with an array of `{status, value|reason}` for each promise."],
      ["What does the spread operator do on an array?", "It expands the iterable's items in place. `[...a, ...b]` creates a new array with all elements of `a` followed by all elements of `b`."],
      ["What is destructuring?", "Syntax that unpacks values from arrays or properties from objects into distinct variables, e.g. `const { name, age } = user`."],
      ["What is hoisting?", "JS's behaviour of moving declarations to the top of their containing scope before execution. `var` and function declarations are hoisted; `let`/`const` are hoisted but not initialised."],
      ["What does `this` refer to inside an arrow function?", "Arrow functions don't have their own `this` — they inherit it from the lexical scope where they were defined."],
      ["What is event delegation?", "A technique where you attach a single listener to a common ancestor instead of each child, then handle events as they bubble up."],
      ["What is the difference between `null` and `undefined`?", "`undefined` means a variable was declared but not assigned. `null` is an explicit assignment representing 'no value'."],
    ],
  },
  {
    title: "Cell biology — mitochondria",
    description: "The powerhouse of the cell, by the numbers.",
    emoji: "🧬",
    color: "emerald",
    cards: [
      ["Why are mitochondria called the powerhouse of the cell?", "They produce most of the cell's ATP through cellular respiration, powering nearly every energy-requiring process in the cell."],
      ["What are cristae and why are they important?", "Folds of the inner mitochondrial membrane. They dramatically increase surface area for the electron transport chain and ATP synthase."],
      ["Where does the citric acid cycle take place?", "In the mitochondrial matrix — the gel-like space enclosed by the inner membrane."],
      ["How many ATP can a single glucose molecule produce in mitochondria?", "Roughly 30–32 ATP through glycolysis, the citric acid cycle, and oxidative phosphorylation combined."],
      ["What is unusual about mitochondrial DNA?", "It's circular like bacterial DNA, inherited only from the mother, and supports the endosymbiotic theory."],
      ["What is the endosymbiotic theory?", "The theory that mitochondria originated as free-living bacteria engulfed by an ancestral eukaryotic cell."],
      ["How do mitochondria reproduce?", "By binary fission, independently of cell division."],
      ["What is the role of the electron transport chain?", "It pumps protons across the inner membrane to create the gradient that drives ATP synthase."],
    ],
  },
  {
    title: "SQL fundamentals",
    description: "Querying, joining, and aggregating relational data.",
    emoji: "🗃️",
    color: "sky",
    cards: [
      ["What's the difference between `INNER JOIN` and `LEFT JOIN`?", "`INNER JOIN` returns only rows that match in both tables. `LEFT JOIN` returns every row from the left table, with `NULL` for any missing right-side match."],
      ["When do you use `GROUP BY`?", "When you want to aggregate rows that share a value into summary rows — typically with `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`."],
      ["What does `HAVING` do that `WHERE` doesn't?", "`WHERE` filters rows before grouping. `HAVING` filters groups after `GROUP BY`."],
      ["What is a primary key?", "A column that uniquely identifies each row. It's `NOT NULL` and indexed automatically."],
      ["What is a foreign key?", "A column that references the primary key of another table, enforcing referential integrity."],
      ["What does `UNION` vs `UNION ALL` do?", "Both stack the results of two `SELECT`s. `UNION` removes duplicate rows; `UNION ALL` keeps everything (faster)."],
      ["When would you use a subquery vs a JOIN?", "JOIN when you need columns from both tables. Subquery when you only need to filter or compute against another table."],
      ["What is an index, and what's the trade-off?", "A B-tree that speeds up reads on the indexed columns. Trade-off: every write must update the index too."],
      ["What does `LEFT JOIN ... WHERE right.col IS NULL` find?", "Rows from the left table that have no matching row in the right — a classic 'anti-join' to find orphans."],
      ["What's a window function?", "A function (like `ROW_NUMBER()`, `RANK()`) that computes a value across a set of rows without collapsing them like `GROUP BY`."],
    ],
  },
];

const FIXED_OWNER = "__sample__";

console.log("Seeding sample decks...");
for (const s of SAMPLES) {
  const existing = await sql`SELECT id FROM decks WHERE title = ${s.title} AND owner_key = ${FIXED_OWNER} LIMIT 1`;
  if (existing.length > 0) {
    console.log("  skip (exists):", s.title);
    continue;
  }
  const [deck] = await sql`
    INSERT INTO decks (title, description, emoji, color, owner_key, is_public)
    VALUES (${s.title}, ${s.description}, ${s.emoji}, ${s.color}, ${FIXED_OWNER}, true)
    RETURNING id
  `;
  const questions = s.cards.map(([q]) => q);
  const answers = s.cards.map(([, a]) => a);
  const positions = s.cards.map((_, i) => i);
  await sql`
    INSERT INTO cards (deck_id, question, answer, position)
    SELECT ${deck.id}::uuid, q, a, p
    FROM unnest(${questions}::text[], ${answers}::text[], ${positions}::int[]) AS t(q, a, p)
  `;
  console.log("  seeded:", s.title, `(${s.cards.length} cards)`);
}
console.log("Done.");
