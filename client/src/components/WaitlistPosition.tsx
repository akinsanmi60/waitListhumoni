import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Share2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WaitlistPosition {
  position: number;
  referralCode: string;
  total: number;
}

interface WaitlistPositionProps {
  email: string;
}

export function WaitlistPosition({ email }: WaitlistPositionProps) {
  const { toast } = useToast();

  const { data: position, isLoading, isError } = useQuery<WaitlistPosition>({
    queryKey: ["/api/waitlist/position", email],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/waitlist/position?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch position");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: email.length > 0,
    retry: 2,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  if (!email) return null;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center p-8"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-4"
      >
        <p className="text-sm text-destructive">
          Unable to fetch your position. Please try again later.
        </p>
      </motion.div>
    );
  }

  if (!position) return null;

  const shareText = `Join me on Humoni's waitlist! Use code ${position.referralCode}: https://joinhumoni.com/?ref=${position.referralCode}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link. Please try again.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <Card className="bg-white/95 shadow-lg border-primary/10">
        <CardContent className="pt-6 pb-4 text-center space-y-4">
          <div>
            <div className="text-3xl font-bold text-primary mb-1">
              #{position.position}
            </div>
            <div className="text-sm text-muted-foreground">
              out of {position.total} on our waitlist
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Your referral code:
            </div>
            <div className="font-mono text-lg font-semibold text-primary">
              {position.referralCode}
            </div>
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white transform transition-all duration-300"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Referral Link
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}