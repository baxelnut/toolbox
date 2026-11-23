// Contexts & Hooks
import { useToast } from "@/contexts";
import type { ProposalController } from "@/hooks";
// Components
import { Button, Disclosure, Select, TextInput } from "@/components";
// Utils
import { NUMBER_FORMAT_OPTIONS, signatureFromFile } from "@/lib/invoice";

export function ProfileSection({ proposal }: { proposal: ProposalController }) {
  const { profile, settings, setProfileField, setSetting } = proposal;
  const { toast } = useToast();

  const upload = async (file: File) => {
    try {
      setProfileField("signature", await signatureFromFile(file));
    } catch (failure) {
      toast(
        failure instanceof Error ? failure.message : "Could not read the image",
      );
    }
  };

  return (
    <Disclosure title="Your details">
      <small className="muted">
        Name and signature are shared with the Invoice tool.
      </small>
      <TextInput
        label="Name on documents"
        hint="Shown on the cover and the signature, for example Basilius Tengang, S.Kom."
        value={profile.signerName}
        onChange={(event) => setProfileField("signerName", event.target.value)}
      />
      <TextInput
        label="Signature image"
        type="file"
        accept="image/*"
        hint="Transparent PNG works best. Saved in this browser only."
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void upload(file);
          event.currentTarget.value = "";
        }}
      />
      {profile.signature && (
        <>
          <img
            src={profile.signature}
            alt="Signature preview"
            style={{ maxHeight: "4rem", background: "#fff" }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProfileField("signature", "")}
          >
            Remove signature
          </Button>
        </>
      )}

      <div className="proposal-row">
        <TextInput
          label="Currency prefix"
          value={profile.currency}
          onChange={(event) => setProfileField("currency", event.target.value)}
        />
        <Select
          label="Amount style"
          options={NUMBER_FORMAT_OPTIONS}
          value={settings.amountStyle}
          hint="Proposals only. Invoices keep their own style."
          onChange={(event) =>
            setSetting(
              "amountStyle",
              event.target.value === "comma" ? "comma" : "dot",
            )
          }
        />
      </div>
      <TextInput
        label="Proposal number format"
        value={settings.numberPattern}
        hint="Tokens: {YYYY}, {MM}, {MMR} for the roman month, {SEQ}."
        onChange={(event) => setSetting("numberPattern", event.target.value)}
      />
    </Disclosure>
  );
}
