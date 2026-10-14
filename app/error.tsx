"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("SwarnaSetu page error", error); }, [error]);
  return <main className="page-shell not-found-card" id="main-content"><div className="hero-note-icon" style={{height:54,width:54}}><AlertTriangle size={24}/></div><div className="eyebrow" style={{marginTop:18}}>Something went wrong</div><h1>That didn't load as expected.</h1><p>We couldn't finish loading this page. Try again, or return to the marketplace. No internal error details are shown here.</p><div className="hero-actions"><button className="button button--gold" onClick={() => reset()}><RefreshCw size={14}/> Try again</button><Link href="/" className="button button--light">Back to marketplace</Link></div></main>;
}
