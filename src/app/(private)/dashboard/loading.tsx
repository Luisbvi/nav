export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0099ff] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600 dark:bg-gray-800 dark:text-gray-200">Loading...</p>
      </div>
    </div>
  );
}
