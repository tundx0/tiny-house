import React, { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Building2, Home as HomeIcon, ImagePlus } from "lucide-react";
import { HOST_LISTING } from "@/mutations";
import { ListingType } from "@/__generated__/graphql";
import { useViewer } from "@/contexts/ViewerContext";
import { stripeAuthUrl } from "@/lib/utils";

const MAX_IMAGE_BYTES = 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

interface FormState {
  type: ListingType | "";
  numOfGuests: string;
  title: string;
  description: string;
  address: string;
  image: string;
  price: string;
}

const initialForm: FormState = {
  type: "",
  numOfGuests: "",
  title: "",
  description: "",
  address: "",
  image: "",
  price: "",
};

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const validate = (
  form: FormState,
): Partial<Record<keyof FormState, string>> => {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.type) errors.type = "Please select a home type.";
  if (!(Number(form.numOfGuests) >= 1))
    errors.numOfGuests = "Please enter at least 1 guest.";
  if (!form.title.trim()) errors.title = "Please enter a title.";
  if (!form.description.trim())
    errors.description = "Please enter a description.";
  if (!form.address.trim()) errors.address = "Please enter an address.";
  if (!form.image) errors.image = "Please upload an image.";
  if (!(Number(form.price) > 0)) errors.price = "Please enter a price.";
  return errors;
};

const inputClass =
  "mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500";

const Field: React.FC<{
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, hint, error, children }) => (
  <div>
    <label className="block">
      <span className="font-semibold text-gray-800">{label}</span>
      {hint && <span className="block text-sm text-gray-500">{hint}</span>}
      {children}
    </label>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

const Host: React.FC = () => {
  const { viewer } = useViewer();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const [hostListing, { loading, error }] = useMutation(HOST_LISTING, {
    onCompleted: (data) => navigate(`/listing/${data.hostListing.id}`),
  });

  if (!viewer.didRequest) {
    return <div className="text-center py-16 text-gray-600">Loading...</div>;
  }

  if (!viewer.id || !viewer.hasWallet) {
    const stripeUrl = stripeAuthUrl();
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          You'll have to be signed in and connected with Stripe to host a
          listing!
        </h1>
        <p className="text-gray-600 mt-4">
          We only allow users who've signed in to our application and have
          connected with Stripe to host new listings.
        </p>
        <div className="mt-6">
          {!viewer.id ? (
            <Link
              to="/login"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            >
              Sign in
            </Link>
          ) : stripeUrl ? (
            <a
              href={stripeUrl}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            >
              Connect with Stripe
            </a>
          ) : (
            <Link
              to={`/user/${viewer.id}`}
              className="text-blue-600 hover:underline"
            >
              Go to your profile
            </Link>
          )}
        </div>
      </div>
    );
  }

  const update =
    (field: keyof FormState) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "You're only able to upload valid JPG or PNG files.",
      }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        image: "You're only able to upload images under 1MB in size.",
      }));
      return;
    }

    const image = await readAsDataUrl(file);
    setForm((prev) => ({ ...prev, image }));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    hostListing({
      variables: {
        input: {
          type: form.type as ListingType,
          numOfGuests: Math.round(Number(form.numOfGuests)),
          title: form.title.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          image: form.image,
          // Prices are stored in cents.
          price: Math.round(Number(form.price) * 100),
        },
      },
    }).catch(() => undefined);
  };

  const typeOption = (
    type: ListingType,
    label: string,
    icon: React.ReactNode,
  ) => (
    <button
      type="button"
      onClick={() => {
        setForm((prev) => ({ ...prev, type }));
        setErrors((prev) => ({ ...prev, type: undefined }));
      }}
      aria-pressed={form.type === type}
      className={`flex items-center gap-2 px-4 py-2 rounded border ${
        form.type === type
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        Hi! Let's get started listing your place.
      </h1>
      <p className="text-gray-600 mt-2">
        In this form, we'll collect some basic and additional information about
        your listing.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        <div>
          <span className="font-semibold text-gray-800">Home type</span>
          <div className="mt-2 flex gap-3">
            {typeOption(
              ListingType.Apartment,
              "Apartment",
              <Building2 className="h-4 w-4" />,
            )}
            {typeOption(
              ListingType.House,
              "House",
              <HomeIcon className="h-4 w-4" />,
            )}
          </div>
          {errors.type && (
            <p className="text-sm text-red-600 mt-1">{errors.type}</p>
          )}
        </div>

        <Field label="Max # of guests" error={errors.numOfGuests}>
          <input
            type="number"
            min={1}
            value={form.numOfGuests}
            onChange={update("numOfGuests")}
            placeholder="4"
            className={inputClass}
          />
        </Field>

        <Field
          label="Title"
          hint="Max character count of 45"
          error={errors.title}
        >
          <input
            type="text"
            maxLength={45}
            value={form.title}
            onChange={update("title")}
            placeholder="The iconic and luxurious Bel-Air mansion"
            className={inputClass}
          />
        </Field>

        <Field
          label="Description of listing"
          hint="Max character count of 400"
          error={errors.description}
        >
          <textarea
            rows={4}
            maxLength={400}
            value={form.description}
            onChange={update("description")}
            placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
            className={inputClass}
          />
        </Field>

        <Field
          label="Address"
          hint="Street, city, state/province and country"
          error={errors.address}
        >
          <input
            type="text"
            value={form.address}
            onChange={update("address")}
            placeholder="251 North Bristol Avenue, Los Angeles, California, United States"
            className={inputClass}
          />
        </Field>

        <div>
          <span className="font-semibold text-gray-800">Image</span>
          <span className="block text-sm text-gray-500">
            Images have to be under 1MB in size and of type JPG or PNG
          </span>
          <label className="mt-2 flex flex-col items-center justify-center w-48 h-36 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 overflow-hidden">
            {form.image ? (
              <img
                src={form.image}
                alt="Listing preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center text-gray-500">
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm mt-1">Upload</span>
              </span>
            )}
            <input
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {errors.image && (
            <p className="text-sm text-red-600 mt-1">{errors.image}</p>
          )}
        </div>

        <Field
          label="Price"
          hint="All prices in $USD/night"
          error={errors.price}
        >
          <input
            type="number"
            min={1}
            step="0.01"
            value={form.price}
            onChange={update("price")}
            placeholder="120"
            className={inputClass}
          />
        </Field>

        {error && (
          <p className="text-sm text-red-600">
            We weren't able to create your listing: {error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
        >
          {loading ? "Creating listing..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Host;
