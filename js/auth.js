const SUPABASE_URL = "https://pjwozxmdspcryvfvydak.supabase.co";
const SUPABASE_KEY = "sb_publishable_yz5e_MBb60CeESHChsn58A_m4UFDRl6";

const client = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function signUp() {

    const email =
        document.getElementById("signupEmail").value;

    const password =
        document.getElementById("signupPassword").value;

    const { data, error } =
        await client.auth.signUp({
            email: email,
            password: password
        });

    if (error) {
        alert(error.message);
    } else {
        alert("Signup Successful!");
        console.log(data);
    }
}

async function login() {

    const email =
        document.getElementById("loginEmail").value;

    const password =
        document.getElementById("loginPassword").value;

    const { data, error } =
        await client.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        alert(error.message);
    } else {

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        window.location.href =
            "dashboard.html";
    }
}

async function logout() {

    await client.auth.signOut();

    localStorage.removeItem("user");

    window.location.href =
        "index.html";
}