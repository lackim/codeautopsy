import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms — codeautopsy",
  description: "Basic website terms for the codeautopsy project.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Website terms"
      intro="Basic terms for using this informational open-source project website."
    >
      <section>
        <h2>Informational purpose</h2>
        <p>
          This website describes codeautopsy and provides links to its software, documentation,
          and source code. Content may change without notice.
        </p>
      </section>

      <section>
        <h2>Software license</h2>
        <p>
          Use, copying, modification, and distribution of codeautopsy are governed by the MIT
          License published with the project, not by these website terms.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          The website, reports, and project information are provided on an &quot;as is&quot; and
          &quot;as available&quot; basis, without warranties of accuracy, availability, or fitness
          for a particular purpose to the extent permitted by law.
        </p>
      </section>

      <section>
        <h2>External services</h2>
        <p>
          Third-party websites and services linked from this site are responsible for their own
          content, availability, and terms.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be raised through the{" "}
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
