import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { getArticle, articles } from "@/content/articles";
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";

function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="text-2xl font-display font-semibold mt-10 mb-4 tracking-tight">
          {block.replace(/^##\s+/, "")}
        </h2>
      );
    }
    const lines = block.split("\n");
    if (lines.every(l => l.trim().startsWith("- "))) {
      return (
        <ul key={i} className="space-y-2 my-4 list-disc list-outside pl-5 text-foreground/90 leading-relaxed">
          {lines.map((l, j) => {
            const content = l.replace(/^\s*-\s+/, "");
            return <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(content) }} />;
          })}
        </ul>
      );
    }
    if (lines.every(l => /^\s*\d+\.\s+/.test(l))) {
      return (
        <ol key={i} className="space-y-2 my-4 list-decimal list-outside pl-5 text-foreground/90 leading-relaxed">
          {lines.map((l, j) => {
            const content = l.replace(/^\s*\d+\.\s+/, "");
            return <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(content) }} />;
          })}
        </ol>
      );
    }
    return (
      <p
        key={i}
        className="text-foreground/90 leading-relaxed my-4"
        dangerouslySetInnerHTML={{ __html: inlineFormat(block) }}
      />
    );
  });
}

function inlineFormat(text: string): string {
  // Only bold (**...**) — no raw HTML in source, safe.
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticle(slug) : undefined;

  useEffect(() => {
    if (article) document.title = `${article.title} | Exam Master`;
    return () => { document.title = "Exam Master | OMR Exam Practice App"; };
  }, [article]);

  if (!article) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold font-display">Article not found</h1>
          <Link to="/blog" className="text-primary hover:underline mt-4 inline-block">
            ← Back to blog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const related = articles.filter(a => a.slug !== article.slug).slice(0, 2);

  return (
    <PublicLayout>
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="w-4 h-4" /> All articles
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map(t => (
            <span key={t} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {t}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-lg text-muted-foreground mt-4 leading-relaxed">{article.description}</p>

        <div className="flex items-center gap-5 text-xs text-muted-foreground mt-6 pb-6 border-b border-border/60">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {article.readingMinutes} min read
          </span>
          <span>By {article.author}</span>
        </div>

        <div className="prose-content mt-2">{renderBody(article.body)}</div>

        <div className="mt-16 p-6 rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent">
          <h3 className="font-display font-semibold text-lg">Put these ideas to work</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create a free Exam Master account and start tracking your prep with the same metrics
            this article describes.
          </p>
          <Link to="/auth" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:underline">
            Start practising free <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h3 className="text-xl font-display font-semibold mb-5">Keep reading</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map(r => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="modern-card p-5 block group">
                  <h4 className="font-semibold group-hover:text-primary transition-colors">{r.title}</h4>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PublicLayout>
  );
}
