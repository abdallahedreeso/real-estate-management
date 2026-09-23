import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="not-found site-container">
      <span>404 / PAGE NOT FOUND</span>
      <h1>Let’s find your way home.</h1>
      <p>This page may have moved. Head back to explore available properties.</p>
      <Link to="/" className="button-primary">Explore homes <ArrowUpRight size={18} /></Link>
    </section>
  );
}
