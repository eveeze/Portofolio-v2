import UnderDevelopment from "../ui/UnderDevelopment"


const Contact = () => {
    const isUnderDevelopment = import.meta.env.VITE_APP_ENV === "development";

    if (isUnderDevelopment) {
        return <UnderDevelopment />;
    }
  return (
    <section className="w-full min-h-dvh">Contact</section>
  )
}

export default Contact