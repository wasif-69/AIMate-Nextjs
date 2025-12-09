
import HeroBanner from "@/component/College/CollegeFinderLanding/Landing";
import Main from "@/component/LandingPage/Main/Main";
import AddModel from "@/component/LandingPage/model_landing/Land";
import Favourite from "@/component/College/Favourite/favourite"

import Footer from "@/component/LandingPage/Footer/Footer"

export default function Home() {
  return (
    <div>
      
      <main><Main/></main>
      <HeroBanner/>
      <AddModel/>
      <Favourite/>
      <footer><Footer/></footer>

    </div>
  );
}
