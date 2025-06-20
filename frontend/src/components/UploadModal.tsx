interface UploadModalProps {
  onSelected: (file: File) => void;
}

function UploadModal({ onSelected }: UploadModalProps) {
  return (
    <label className="border-cherry font-gs hover:bg-cherry cursor-pointer rounded-2xl border-2 border-solid bg-white px-9 py-3 font-normal transition-colors hover:cursor-pointer hover:border-black hover:text-white">
      choose file
      <input
        type="file"
        id="fileElem"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.[0]) {
            onSelected(files[0]);
          }
        }}
      />
    </label>
  );
}

export default UploadModal;
