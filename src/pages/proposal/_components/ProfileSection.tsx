// Contexts & Hooks
import type { ProposalController } from "@/hooks";
import { useToast } from "@/contexts";
// Components
import { Button, Disclosure, Select, TextInput } from "@/components";
// Utils
import { signatureFromFile, NUMBER_FORMAT_OPTIONS } from "@/lib/invoice";

export function ProfileSection({ proposal }: { proposal: ProposalController }) {
  const { profile, settings, setProfileField } = proposal;
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
      <small className="muted">Shared with the Invoice tool.</small>
      <TextInput
        label="Name"
        value={profile.name}
        onChange={(event) => setProfileField("name", event.target.value)}
      />
      <div className="proposal-row">
        <TextInput
          label="Email"
          type="email"
          value={profile.email}
          onChange={(event) => setProfileField("email", event.target.value)}
        />
        <TextInput
          label="Phone"
          type="tel"
          value={profile.phone}
          onChange={(event) => setProfileField("phone", event.target.value)}
        />
      </div>
      <TextInput
        label="Website"
        value={profile.website}
        onChange={(event) => setProfileField("website", event.target.value)}
      />
      <div className="proposal-row">
        <TextInput
          label="Signer name"
          value={profile.signerName}
          onChange={(event) =>
            setProfileField("signerName", event.target.value)
          }
        />
        <TextInput
          label="Signer role"
          value={profile.signerRole}
          onChange={(event) =>
            setProfileField("signerRole", event.target.value)
          }
        />
      </div>

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
          value={profile.numberFormat}
          onChange={(event) =>
            setProfileField(
              "numberFormat",
              event.target.value === "dot" ? "dot" : "comma",
            )
          }
        />
      </div>
      <TextInput
        label="Proposal number format"
        value={settings.numberPattern}
        hint="Tokens: {YYYY}, {MM}, {MMR} for the roman month, {SEQ}."
        onChange={(event) => proposal.setNumberPattern(event.target.value)}
      />
    </Disclosure>
  );
}
