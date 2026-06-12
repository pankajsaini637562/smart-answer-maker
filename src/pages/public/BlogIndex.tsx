import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { articles } from "@/content/articles";
import { Clock, ChevronRight } from "lucide-react";

export default function BlogIndex() {
  return (
    <PublicLayout>
      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Exam Master Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
            Strategy, tactics, and analytics for OMR exam prep
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Practical, written-by-aspirants guides on NEET, JEE, CUET, CLAT, and the daily
            habits behind a top rank.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {articles.map(a => (
            <Link
              key={a.slug}
              to={`/blog/${a.slug}`}
              className="modern-card p-6 group block"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {a.tags.map(t => (
                  <span key={t} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="text-xl font-display font-semibold leading-snug group-hover:text-primary transition-colors">
                {a.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">{a.description}</p>
              <div className="flex items-center justify-between mt-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {a.readingMinutes} min read
                </span>
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  Read article <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
