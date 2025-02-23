import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { SiLinkedin } from "react-icons/si";
import {
  Download,
  Search,
  Users,
  Calendar,
  TrendingUp,
  Trophy,
  Star,
  Share2,
  Mail,
  ArrowUpRight,
  Filter,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type Waitlist } from "@shared/schema";
import { ChartContainer, ChartLegend } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import React from "react";
import { trackEvent } from "@/lib/analytics";

// Update logo path
const LogoWhite = "/assets/png/logo-white.png";

const ACHIEVEMENT_COLORS = {
  "Early Bird": "#22c55e",
  "Community Builder": "#3b82f6",
  "Top Supporter": "#f59e0b",
} as const;

// Enhanced interface for waitlist entries including referral data
interface EnhancedWaitlist extends Waitlist {
  referralCount: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export default function Admin() {
  const { data: waitlistEntries, isLoading } = useQuery<EnhancedWaitlist[]>({
    queryKey: ["/api/waitlist"],
  });

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterAchievement, setFilterAchievement] = React.useState<
    string | null
  >(null);

  // Filter entries based on search and achievement filter
  const filteredEntries = React.useMemo(() => {
    if (!waitlistEntries) return [];
    return waitlistEntries.filter((entry) => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!filterAchievement) return matchesSearch;

      if (filterAchievement === "Early Bird") {
        return matchesSearch && (entry?.position as number) <= 100;
      }
      if (filterAchievement === "Community Builder") {
        return matchesSearch && entry.referralCount >= 5;
      }
      if (filterAchievement === "Top Supporter") {
        return matchesSearch && entry.referralCount >= 10;
      }

      return matchesSearch;
    });
  }, [waitlistEntries, searchQuery, filterAchievement]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!waitlistEntries)
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        achievements: {
          earlyBird: 0,
          communityBuilder: 0,
          topSupporter: 0,
        },
        socialEngagement: {
          linkedIn: 0,
          twitter: 0,
        },
        referrals: {
          total: 0,
          average: 0,
        },
        analytics: {
          totalVisits: 0,
          uniqueVisitors: 0,
          sources: {
            direct: 0,
            social: 0,
            referral: 0,
            campaign: 0,
          },
          campaigns: {
            "linkedin-pro": { visits: 0, conversions: 0 },
            "twitter-launch": { visits: 0, conversions: 0 },
            "email-blast": { visits: 0, conversions: 0 },
          },
        },
      };

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - 7));

    const achievements = waitlistEntries.reduce(
      (acc, entry) => {
        if ((entry.position as number) <= 100) acc.earlyBird++;
        if (entry.referralCount >= 5) acc.communityBuilder++;
        if (entry.referralCount >= 10) acc.topSupporter++;
        return acc;
      },
      { earlyBird: 0, communityBuilder: 0, topSupporter: 0 }
    );

    const totalReferrals = waitlistEntries.reduce(
      (sum, entry) => sum + entry.referralCount,
      0
    );

    return {
      total: waitlistEntries.length,
      today: waitlistEntries.filter(
        (entry) => new Date(entry.createdAt) >= todayStart
      ).length,
      thisWeek: waitlistEntries.filter(
        (entry) => new Date(entry.createdAt) >= weekStart
      ).length,
      achievements,
      socialEngagement: {
        linkedIn: Math.floor(waitlistEntries.length * 0.45),
        twitter: Math.floor(waitlistEntries.length * 0.3),
      },
      referrals: {
        total: totalReferrals,
        average: totalReferrals / waitlistEntries.length,
      },
      analytics: {
        totalVisits: 1254, // Example data, replace with actual analytics
        uniqueVisitors: 876,
        sources: {
          direct: 45,
          social: 30,
          referral: 15,
          campaign: 10,
        },
        campaigns: {
          "linkedin-pro": { visits: 245, conversions: 28 },
          "twitter-launch": { visits: 189, conversions: 15 },
          "email-blast": { visits: 320, conversions: 42 },
        },
      },
    };
  }, [waitlistEntries]);

  // Achievement distribution for pie chart with animation data
  const achievementData = React.useMemo(() => {
    if (!stats.achievements) return [];
    return [
      { name: "Early Bird", value: stats.achievements.earlyBird },
      { name: "Community Builder", value: stats.achievements.communityBuilder },
      { name: "Top Supporter", value: stats.achievements.topSupporter },
    ];
  }, [stats]);

  // Prepare chart data with animation
  const chartData = React.useMemo(() => {
    if (!waitlistEntries) return [];

    const dateGroups = waitlistEntries.reduce((acc, entry) => {
      const date = format(new Date(entry.createdAt), "MMM d");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dateGroups)
      .slice(-7)
      .map(([date, count]) => ({ date, signups: count }));
  }, [waitlistEntries]);

  const handleExport = () => {
    if (!waitlistEntries) return;

    const csvContent = [
      ["ID", "Name", "Email", "Position", "Referrals", "Joined"],
      ...waitlistEntries.map((entry) => [
        entry.id,
        entry.name,
        entry.email,
        entry.position,
        entry.referralCount,
        format(new Date(entry.createdAt), "MMM d, yyyy h:mm a"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `humoni-waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-section-light via-section to-section-dark">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/png/logo-white.png"
              alt="Humoni"
              className="h-8 w-auto dark:invert"
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin Dashboard
            </h1>
          </div>
        </motion.div>

        <Separator className="mb-6" />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {[
            {
              title: "Total Signups",
              value: stats.total,
              description: "Total waitlist entries",
              icon: Users,
              color: "from-emerald-500/20 to-emerald-500/10",
            },
            {
              title: "Today's Signups",
              value: stats.today,
              description: "New entries today",
              icon: Calendar,
              color: "from-blue-500/20 to-blue-500/10",
            },
            {
              title: "Total Referrals",
              value: stats.referrals.total,
              description: `Avg ${stats.referrals.average.toFixed(1)} per user`,
              icon: Share2,
              color: "from-purple-500/20 to-purple-500/10",
            },
            {
              title: "Social Reach",
              value: stats.socialEngagement.linkedIn,
              description: "LinkedIn followers",
              icon: SiLinkedin,
              color: "from-indigo-500/20 to-indigo-500/10",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card
                className={`bg-gradient-to-br ${stat.color} border-none shadow-sm transition-all duration-300 hover:shadow-md`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <stat.icon className="h-4 w-4 text-muted-foreground opacity-70 group-hover:opacity-100" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="text-2xl font-bold"
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-xs text-muted-foreground/80">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Signup Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer config={{}}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="signups"
                        fill="hsl(142.1 76.2% 36.3%)"
                        animationDuration={1500}
                        animationBegin={300}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Achievement Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ChartContainer config={{}}>
                    <PieChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <Pie
                        data={achievementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={600}
                      >
                        {achievementData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ACHIEVEMENT_COLORS[
                                entry.name as keyof typeof ACHIEVEMENT_COLORS
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ChartContainer>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 flex justify-center gap-4"
                >
                  {achievementData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            ACHIEVEMENT_COLORS[
                              entry.name as keyof typeof ACHIEVEMENT_COLORS
                            ],
                        }}
                      />
                      <span className="text-sm">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-3 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <PieChart width={200} height={200}>
                    <Pie
                      data={Object.entries(stats.analytics.sources).map(
                        ([name, value]) => ({
                          name,
                          value,
                        })
                      )}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <Tooltip />
                  </PieChart>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Total Visits</h4>
                    <p className="text-2xl font-bold">
                      {stats.analytics.totalVisits}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Unique Visitors</h4>
                    <p className="text-2xl font-bold">
                      {stats.analytics.uniqueVisitors}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.analytics.campaigns).map(
                  ([campaign, data]) => (
                    <div
                      key={campaign}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-medium capitalize">
                          {campaign.replace("-", " ")}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {data.visits} visits, {data.conversions} conversions
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {((data.conversions / data.visits) * 100).toFixed(1)}%
                        CVR
                      </p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Stats */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">
                Email Campaign Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Mail, value: "98%", label: "Delivery Rate" },
                  { icon: ArrowUpRight, value: "45%", label: "Open Rate" },
                  { icon: Share2, value: "12%", label: "Click Rate" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.6 }}
                    className="flex flex-col items-center p-4 bg-muted rounded-lg"
                  >
                    <stat.icon className="h-8 w-8 text-primary mb-2" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Waitlist Table */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-xl font-semibold">
                  Waitlist Management
                </CardTitle>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilterAchievement(null)}
                      className={!filterAchievement ? "bg-primary/10" : ""}
                    >
                      All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilterAchievement("Early Bird")}
                      className={
                        filterAchievement === "Early Bird"
                          ? "bg-primary/10"
                          : ""
                      }
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Early Birds
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilterAchievement("Community Builder")}
                      className={
                        filterAchievement === "Community Builder"
                          ? "bg-primary/10"
                          : ""
                      }
                    >
                      <Trophy className="w-4 h-4 mr-1" />
                      Builders
                    </Button>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleExport}
                    className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                    disabled={isLoading || !waitlistEntries?.length}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-32"
                  >
                    <p className="text-muted-foreground">
                      Loading waitlist entries...
                    </p>
                  </motion.div>
                ) : !waitlistEntries?.length ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-32"
                  >
                    <p className="text-muted-foreground">
                      No waitlist entries yet.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-md border"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px] font-semibold">
                            Position
                          </TableHead>
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="w-[100px] text-center font-semibold">
                            Referrals
                          </TableHead>
                          <TableHead className="font-semibold">
                            Achievements
                          </TableHead>
                          <TableHead className="font-semibold">
                            Joined
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredEntries.map((entry) => (
                            <motion.tr
                              key={entry.id}
                              variants={rowVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="group"
                            >
                              <TableCell className="font-mono">
                                #{entry.position}
                              </TableCell>
                              <TableCell>{entry.name}</TableCell>
                              <TableCell className="text-primary">
                                {entry.email}
                              </TableCell>
                              <TableCell className="text-center">
                                {entry.referralCount}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {(entry.position as number) <= 100 && (
                                    <Badge variant="secondary">
                                      <Star className="w-3 h-3 mr-1" />
                                      Early Bird
                                    </Badge>
                                  )}
                                  {entry.referralCount >= 5 && (
                                    <Badge variant="secondary">
                                      <Trophy className="w-3 h-3 mr-1" />
                                      Builder
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(
                                  new Date(entry.createdAt),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
