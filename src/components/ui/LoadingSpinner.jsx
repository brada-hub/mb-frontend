export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full min-h-[50vh] animate-fade-in">
      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
  );
}
