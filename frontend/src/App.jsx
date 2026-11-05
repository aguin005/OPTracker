import { createProfile, useSavedData } from "./storage";
import WelcomeScreen from "./components/WelcomeScreen";
import OnePieceTracker from "./components/OnePieceTracker";

export default function App() {
  const [data, setData] = useSavedData();

  // No name on file means this browser hasn't been set up yet, so ask for one
  // before showing the tracker. Restoring a backup can fill it in as well.
  if (!data.profile) {
    return (
      <WelcomeScreen
        onStart={(name) => setData((prev) => ({ ...prev, profile: createProfile(name) }))}
        onRestore={setData}
      />
    );
  }

  return <OnePieceTracker data={data} setData={setData} />;
}
