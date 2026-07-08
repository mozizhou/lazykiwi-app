export default function Placeholder({ pageId }) {
  const title = pageId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-500 mt-2">This is a placeholder for the {title} page in the LazyKiwi demo.</p>
    </div>
  );
}
