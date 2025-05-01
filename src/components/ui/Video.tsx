interface VideoProps {
  children?: React.ReactNode;
}
const VideoBackground: React.FC<VideoProps> = ({ children }) => {
  return (
    <div className="overflow-hidden relative w-full h-screen">
      <video
        autoPlay
        loop
        muted
        className="object-cover absolute top-0 left-0 w-full h-full"
      >
        <source src="/bg.mp4" />
        your Browser does not support the video tag
      </video>

      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

export default VideoBackground;
