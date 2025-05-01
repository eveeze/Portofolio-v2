import Lanyard from "../../ui/Badge";

const Profile = () => {
  return (
    <section
      id="profile-section"
      className="flex justify-center items-center mx-auto w-full h-full min-h-screen rounded-xl border-white"
    >
      <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
    </section>
  );
};

export default Profile;
