import { Container } from "@/components/container";

type InfoSection = {
  body: React.ReactNode;
  title: string;
};

export function InfoPage({
  eyebrow,
  intro,
  sections,
  title,
}: {
  eyebrow: string;
  intro: string;
  sections: InfoSection[];
  title: string;
}) {
  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <p className="text-primary text-sm font-medium">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground mt-4 text-lg leading-8">{intro}</p>
      <div className="mt-10 space-y-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <div className="text-muted-foreground mt-3 space-y-3 leading-7">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
