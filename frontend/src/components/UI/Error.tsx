import Button from "@mui/material/Button";
import type { ErrorProps } from "../../types";

const Error = ({ refetch, isFetching }: ErrorProps) => {
  return (
    <div className="flex justify-center">
      <div className="m-8 bg-cardBg p-6 rounded-4xl shadow max-w-sm w-full text-center">
        <p className="mb-4">Unable to reach the server, please try again.</p>
        <Button
          onClick={() => refetch?.()}
          color="secondary"
          variant="contained"
          loading={isFetching}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default Error;
