import { HandHeart } from "lucide-react";

export default function DonationSection() {
  return (
    <section className="donation-section" id="donation-section">
      <div className="donation-icon">
        <HandHeart size={28} />
      </div>
      <h2>Keep Mehrabani Independent &amp; Free</h2>
      <p>
        We never display ads and never charge for materials. We rely solely on
        the generous support of global learners to server host our database.
      </p>
      <a href="#" className="btn btn-blue btn-lg">
        Make a Small Donation
      </a>
    </section>
  );
}
