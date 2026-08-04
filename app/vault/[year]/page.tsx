import Link from "next/link";
import { notFound } from "next/navigation";
import { vaultData } from "@/components/vault/data";

export default async function VaultResult({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const vault = vaultData[year];
  if (!vault) notFound();

  return (
    <main className={`result-page ${vault.pageClass}`}>
      <div className={`result-graphic result-${vault.variant}`} aria-hidden="true"><i /><i /><i /><b /></div>
      <section className="result-card">
        <p>Vault Unlocked</p>
        <strong>{vault.year}</strong>
        <h1>{vault.title}</h1>
        <h2>Entering the Malhar archives</h2>
        <Link href={`/?year=${year}`}>Return to vault selection</Link>
      </section>
    </main>
  );
}
