"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";

export default function LoginPage() {
    const router = useRouter();
    const { state, loadingUser, login } = useAppData();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loadingUser && state.user) {
            router.replace("/");
        }
    }, [loadingUser, state.user, router]);

    const onSubmit = async (event) => {
        event.preventDefault();

        try {
            setError("");
            await login(username, password);
            router.push("/");
        } catch (loginError) {
            setError(loginError.message);
        }
    };

    return (
        <section className="login-card">
            <h2>Login</h2>
            <p>Login ด้วยบัญชีเริ่มต้นทั้งหมดได้ด้วยรหัสผ่าน password</p>

            {error ? <p className="notice error">{error}</p> : null}

            <form className="form-grid" onSubmit={onSubmit}>
                <label>
                    Username
                    <input value={username} onChange={(event) => setUsername(event.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </label>
                <button type="submit">Login</button>
            </form>

            <section className="table-wrap">
                <h3>Default Users</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>admin</td><td>admin</td><td>password</td></tr>
                        <tr><td>manager</td><td>manager</td><td>password</td></tr>
                        <tr><td>user1</td><td>staff</td><td>password</td></tr>
                        <tr><td>user2</td><td>staff</td><td>password</td></tr>
                        <tr><td>user3</td><td>staff</td><td>password</td></tr>
                    </tbody>
                </table>
            </section>
        </section>
    );
}
