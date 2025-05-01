import UnderDevelopment from "../ui/UnderDevelopment"
const Project = () => {
    const isUnderDevelopment = import.meta.env.VITE_APP_ENV === "development";
    if (isUnderDevelopment) {
        return <UnderDevelopment />;
    }   
  return (
    <section className="w-full min-h-dvh">Project</section>
  )
}

export default Project