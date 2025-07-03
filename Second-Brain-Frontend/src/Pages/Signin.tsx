import { Button } from "../Components/Button";
import { Input } from "../Components/Input";
import { useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";

export function Signin() {
  const usernameRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();
  const navigate = useNavigate();

  async function signin() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;
    const response = await axios.post(BACKEND_URL + "/api/v1/signin", {
      username,
      password,
    });
    const jwt = response.data.token;
    localStorage.setItem("token", jwt);
    navigate("/dashboard");
  }
  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
      <div className="bg-white rounded-xl border min-w-48 p-8">
        <div className="flex justify-center items-center text-2xl">
          <h1>Sign In</h1>
        </div>
        <div className="p-2 m-5 w-80">
          <Input ref={usernameRef} placeholder="Username" />
        </div>
        <div className="p-2 m-5 w-80">
          <Input ref={passwordRef} placeholder="Password" />
        </div>

        <div className="flex justify-center pt-4">
          <Button
            variant="primary"
            text="Sign In"
            size="lg"
            fullwidth
            loading={false}
            onClick={signin}
          />
        </div>
      </div>
    </div>
  );
}
