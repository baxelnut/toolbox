// Contexts & Hooks
import type { ProposalController } from "@/hooks";
import { useToast } from "@/contexts";
// Components
import { Button, Disclosure, TextInput } from "@/components";
// Utils
import { signatureFromFile } from "@/lib/invoice";

export function ClientSection({ proposal }: { proposal: ProposalController }) {
  const { draft } = proposal;
  const { toast } = useToast();

  const upload = async (file: File) => {
    try {
      proposal.set("coverLogo", await signatureFromFile(file));
    } catch (failure) {
      toast(
        failure instanceof Error ? failure.message : "Could not read the image",
      );
    }
  };

  return (
    <Disclosure title="Client and cover" defaultOpen>
      <TextInput
        label="Client name"
        autoComplete="off"
        value={draft.clientName}
        onChange={(event) => proposal.set("clientName", event.target.value)}
      />
      <TextInput
        label="Unit or department"
        hint="Second line under the client name. Optional."
        value={draft.clientUnit}
        onChange={(event) => proposal.set("clientUnit", event.target.value)}
      />
      <TextInput
        label="Project name"
        placeholder="Platform Digital"
        value={draft.projectName}
        onChange={(event) => proposal.set("projectName", event.target.value)}
      />
      <TextInput
        label="Client logo"
        type="file"
        accept="image/*"
        hint="Shown in the middle of the cover. Resized to 640 px and saved in this browser only."
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void upload(file);
          event.currentTarget.value = "";
        }}
      />
      {draft.coverLogo && (
        <>
          <img
            src={draft.coverLogo}
            alt="Logo preview"
            style={{ maxHeight: "5rem", background: "#fff" }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => proposal.set("coverLogo", "")}
          >
            Remove logo
          </Button>
        </>
      )}
    </Disclosure>
  );
}
