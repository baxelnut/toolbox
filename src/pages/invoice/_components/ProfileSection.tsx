// Contexts & Hooks
import { useToast } from "@/contexts";
import type { InvoiceController } from "@/hooks";
// Components
import { Button, Disclosure, Select, TextInput } from "@/components";
import { NUMBER_FORMAT_OPTIONS, signatureFromFile } from "@/lib/invoice";

export function ProfileSection({ invoice }: { invoice: InvoiceController }) {
  const { profile, setProfileField } = invoice;
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
      <TextInput
        label="Name"
        value={profile.name}
        onChange={(event) => setProfileField("name", event.target.value)}
      />
      <div className="invoice-row">
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

      <div className="invoice-row">
        <TextInput
          label="Bank"
          value={profile.bankName}
          onChange={(event) => setProfileField("bankName", event.target.value)}
        />
        <TextInput
          label="Account number"
          value={profile.accountNumber}
          onChange={(event) =>
            setProfileField("accountNumber", event.target.value)
          }
        />
      </div>
      <TextInput
        label="Account name"
        value={profile.accountName}
        onChange={(event) => setProfileField("accountName", event.target.value)}
      />

      <div className="invoice-row">
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

      <TextInput
        label="Number format"
        value={profile.numberPattern}
        hint="Tokens: {YYYY}, {MM}, {MMR} for the roman month, {SEQ}."
        onChange={(event) =>
          setProfileField("numberPattern", event.target.value)
        }
      />
      <div className="invoice-row">
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
    </Disclosure>
  );
}
