import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — codeautopsy",
  description: "Privacy information for the codeautopsy project website.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy notice"
      intro="A short explanation of what this project website does—and deliberately does not—collect."
    >
      <section>
        <h2>About this website</h2>
        <p>
          This website provides information about codeautopsy. It does not use first-party
          analytics, advertising trackers, contact forms, or non-essential cookies.
        </p>
      </section>

      <section>
        <h2>GitHub Pages hosting</h2>
        <p>
          The site is hosted by GitHub Pages. GitHub records visitors&apos; IP addresses for security
          purposes and may process other technical request data under its{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            privacy statement
          </a>
          .
        </p>
      </section>

      <section>
        <h2>External links</h2>
        <p>
          Links to GitHub, npm, and other third-party services take you to websites governed by
          their own privacy policies.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For questions about this notice, contact the maintainers through the{" "}
          <a
            href="https://github.com/lackim/codeautopsy/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            project issue tracker
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
