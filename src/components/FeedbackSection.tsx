import { useState } from "react";
import { Star, Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FeedbackSectionProps {
  t: (key: string) => string;
}

export function FeedbackSection({ t }: FeedbackSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("feedback" as any).insert({
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast({ title: t("feedback_sent"), description: t("feedback_thanks") });
    } catch (err: any) {
      toast({ title: t("auth_error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center space-y-2 animate-fade-in">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={cn(
                "h-6 w-6 transition-all duration-300",
                i <= rating ? "fill-yellow-400 text-yellow-400 scale-110" : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-primary">{t("feedback_thanks")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("feedback_title")}</h3>
          <p className="text-xs text-muted-foreground">{t("feedback_desc")}</p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-2 py-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHoveredStar(i)}
            onMouseLeave={() => setHoveredStar(0)}
            className="group transition-transform duration-150 hover:scale-125 active:scale-95"
          >
            <Star
              className={cn(
                "h-8 w-8 transition-all duration-200",
                i <= (hoveredStar || rating)
                  ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]"
                  : "text-muted-foreground/30 group-hover:text-muted-foreground/50"
              )}
            />
          </button>
        ))}
      </div>

      {/* Comment */}
      <Textarea
        placeholder={t("feedback_comment")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="resize-none text-sm"
      />

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || loading}
        className="w-full gap-2"
        size="sm"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t("feedback_send")}
          </>
        )}
      </Button>
    </div>
  );
}
