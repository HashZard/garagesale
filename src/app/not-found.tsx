import { Container } from "@/components/container";
import { PageState } from "@/components/page-state";

export default function NotFound() {
  return (
    <Container className="py-16">
      <PageState
        title="We couldn't find that page"
        description="The garage sale may have ended or the link may be incorrect."
        actionHref="/"
        actionLabel="Find garage sales"
      />
    </Container>
  );
}
