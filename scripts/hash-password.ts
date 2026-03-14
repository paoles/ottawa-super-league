import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npx tsx scripts/hash-password.ts <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const escaped = hash.replace(/\$/g, "\$");
console.log("Raw hash:", hash);
console.log("For .env.local (escape $ as \$):", escaped);
