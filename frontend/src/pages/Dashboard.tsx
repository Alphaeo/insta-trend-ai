import { Users, TrendingUp, Calendar, Target, Zap } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      icon: Users,
      value: "24.8K",
      label: "Total Followers",
      change: "+12.5%",
      positive: true,
    },
    {
      icon: TrendingUp,
      value: "8.4%",
      label: "Engagement Rate",
      change: "+2.1%",
      positive: true,
    },
    {
      icon: Calendar,
      value: "156",
      label: "Content Posts",
      change: "-3.2%",
      positive: false,
    },
    {
      icon: Target,
      value: "78%",
      label: "Goal Progress",
      change: "+15.7%",
      positive: true,
    },
  ];

  const activities = [
    {
      icon: "📱",
      text: 'Posted "Morning Routine" on Instagram',
      time: "2 hours ago",
    },
    {
      icon: "🤖",
      text: "Strategist created new content plan",
      time: "4 hours ago",
    },
    {
      icon: "📈",
      text: "Gained 127 new followers",
      time: "6 hours ago",
    },
    {
      icon: "🤖",
      text: "Copywriter generated 5 new scripts",
      time: "1 day ago",
    },
    {
      icon: "🎉",
      text: "Reached 25K follower milestone",
      time: "2 days ago",
    },
  ];

  const tasks = [
    {
      title: "Review content calendar for next week",
      due: "Due: Today",
      priority: "high",
    },
    {
      title: "Create Instagram Reels for weekend",
      due: "Due: Tomorrow",
      priority: "medium",
    },
    {
      title: "Analyze performance metrics",
      due: "Due: This week",
      priority: "low",
    },
    {
      title: "Plan collaboration with @influencer",
      due: "Due: Next week",
      priority: "medium",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Welcome back! Here's your social media overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-3xl p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={
                    stat.positive ? "text-green-600" : "text-red-600"
                  }
                >
                  {stat.positive ? "↗" : "↘"}
                </span>
                <span
                  className={`text-sm font-medium ${
                    stat.positive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity and Tasks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-muted/50 rounded-2xl"
              >
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{activity.text}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-secondary" />
            <h2 className="text-2xl font-bold text-foreground">
              Upcoming Tasks
            </h2>
          </div>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="p-4 bg-muted/50 rounded-2xl space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-foreground font-medium flex-1">
                    {task.title}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : task.priority === "medium"
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{task.due}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
