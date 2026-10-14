import Link from "next/link";
import { ArrowLeft, Gem, Search } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
export default function NotFound(){return <><main className="page-shell not-found-card" id="main-content"><div className="not-found-number">404</div><div className="eyebrow">This path isn't in the collection</div><h1>We couldn't find that page.</h1><p>The page may have moved, or the address may be incorrect. Head back to the marketplace to discover jewellery and local jewellers.</p><div className="hero-actions"><Link href="/" className="button button--gold"><ArrowLeft size={14}/> Back to marketplace</Link><Link href="/#discover" className="button button--light"><Search size={14}/> Browse jewellery</Link></div></main><SiteFooter/></>}
