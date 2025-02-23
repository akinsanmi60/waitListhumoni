import { motion } from "framer-motion";
import { Trophy, Star, Share2, Users, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackReferral } from "@/lib/analytics";
import { MILESTONES, type WaitlistPosition } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface WaitlistProgressProps {
  email: string;
}

export function WaitlistProgress({ email }: WaitlistProgressProps) {
  const { data: position } = useQuery<WaitlistPosition>({
    queryKey: ["/api/waitlist/position", email],
    enabled: !!email,
  });

  if (!position) return null;

  const progress =
    ((position.total - Number(position?.position as number)) / position.total) *
    100;
  const referralLink = `${window.location.origin}?ref=${position.referralCode}`;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Join me on Humoni Waitlist!",
        text: `Skip the line and join me on Humoni's exclusive waitlist! Use my referral code: ${position.referralCode}`,
        url: referralLink,
      });
      trackReferral(position.referralCode);
    } catch (err) {
      // Fallback to clipboard copy
      navigator.clipboard.writeText(referralLink);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Progress</h3>
          <p className="text-sm text-muted-foreground">
            Position #{position.position} of {position.total}
          </p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Your Achievements</h4>
        <div className="flex flex-wrap gap-2">
          {(position?.position as number) <= 100 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge variant="secondary" className="animate-float">
                <Star className="w-3 h-3 mr-1" />
                Early Bird
              </Badge>
            </motion.div>
          )}
          {position.referralCount > 0 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge variant="secondary" className="animate-float">
                <Share2 className="w-3 h-3 mr-1" />
                First Referral
              </Badge>
            </motion.div>
          )}
          {position.referralCount >= 5 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge variant="secondary" className="animate-float">
                <Users className="w-3 h-3 mr-1" />
                Community Builder
              </Badge>
            </motion.div>
          )}
          {position.referralCount >= 10 && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge variant="secondary" className="animate-float">
                <Trophy className="w-3 h-3 mr-1" />
                Top Supporter
              </Badge>
            </motion.div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Share & Move Up</h4>
        <p className="text-sm text-muted-foreground">
          You've referred {position.referralCount}{" "}
          {position.referralCount === 1 ? "person" : "people"}. Share your link
          to move up faster!
        </p>
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleShare}
              className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <Share2 className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
              Share Referral Link
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={() =>
                navigator.clipboard.writeText(position.referralCode)
              }
              className="group"
            >
              <span className="transition-transform group-hover:scale-105">
                {position.referralCode}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="relative p-4 bg-gradient-to-br from-muted/80 to-muted rounded-lg"
        initial={false}
        animate={position.referralCount >= 3 ? "visible" : "hidden"}
        variants={{
          visible: { opacity: 1, height: "auto", y: 0 },
          hidden: { opacity: 0, height: 0, y: 20 },
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h4 className="text-sm font-medium">Next Milestone</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          {position.referralCount < 5
            ? `Refer ${
                5 - position.referralCount
              } more to unlock Community Builder badge!`
            : `Refer ${
                10 - position.referralCount
              } more to unlock Top Supporter badge!`}
        </p>
        <motion.div
          className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
