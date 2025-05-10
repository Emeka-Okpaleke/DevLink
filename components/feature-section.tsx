import { Code, Users, Briefcase } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: <Code className="h-10 w-10" />,
      title: "Developer Portfolio",
      description:
        "Create a stunning portfolio to showcase your projects, skills, and experience to potential employers and collaborators.",
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Developer Network",
      description: "Connect with other developers, follow their work, and build meaningful professional relationships.",
    },
    {
      icon: <Briefcase className="h-10 w-10" />,
      title: "Project Showcase",
      description:
        "Highlight your best work with detailed project pages including descriptions, technologies used, and live demos.",
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why DevLink?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg border">
              <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
