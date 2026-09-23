import Banner from "../components/Home/Banner";
import ListingMapView from "@/components/Home/ListingMapView";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
// import HouseContextProvider from '@/components/Home/HouseContext';
const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="home-page">
      <Banner />
      <ListingMapView />
      <section className="owner-section">
        <div className="site-container owner-inner">
          <div><span className="owner-kicker">{t("redesign.ownerTag")}</span><h2>{t("redesign.ownerTitle")}</h2><p>{t("redesign.ownerIntro")}</p></div>
          <Link to="/AddProperty" className="owner-link">{t("redesign.ownerAction")} <ArrowUpRight size={20} /></Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
