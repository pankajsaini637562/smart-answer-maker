import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in every field");
      return;
    }
    if (message.length > 2000) {
      toast.error("Message is too long");
      return;
    }
    setSending(true);
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    const subject = encodeURIComponent("Exam Master enquiry");
    window.location.href = `mailto:hello@exam-master.app?subject=${subject}&body=${body}`;
    setTimeout(() => { setSending(false); toast.success("Opening your email client…"); }, 400);
  };

  return (
    <PublicLayout>
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Get in touch</p>
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">Contact us</h1>
        <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
          Feature requests, bug reports, partnership questions, or just want to say hi — we read
          every message.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          <div className="modern-card p-5">
            <Mail className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-semibold">Email</h3>
            <p className="text-xs text-muted-foreground mt-1 break-all">hello@exam-master.app</p>
          </div>
          <div className="modern-card p-5">
            <MessageCircle className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-semibold">In-app chat</h3>
            <p className="text-xs text-muted-foreground mt-1">Available after sign-in via the AI Coach.</p>
          </div>
          <div className="modern-card p-5">
            <Send className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-semibold">Response time</h3>
            <p className="text-xs text-muted-foreground mt-1">Usually within 1–2 working days.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modern-card p-6 mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="c-name">Your name</Label>
            <Input id="c-name" value={name} onChange={e => setName(e.target.value)} maxLength={80} className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={120} className="rounded-xl h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-msg">Message</Label>
            <Textarea
              id="c-msg"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              maxLength={2000}
              className="rounded-xl resize-none"
              placeholder="Tell us what's on your mind…"
            />
            <p className="text-[11px] text-muted-foreground text-right">{message.length}/2000</p>
          </div>
          <Button type="submit" disabled={sending} className="rounded-full gap-2 w-full sm:w-auto">
            <Send className="w-4 h-4" /> {sending ? "Sending…" : "Send message"}
          </Button>
        </form>
      </section>
    </PublicLayout>
  );
}
