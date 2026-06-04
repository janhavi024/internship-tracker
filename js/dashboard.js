const SUPABASE_URL = "https://pjwozxmdspcryvfvydak.supabase.co";
const SUPABASE_KEY = "sb_publishable_yz5e_MBb60CeESHChsn58A_m4UFDRl6";


const client = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let currentResumeUrl = "";

/* =====================
   SAVE / UPDATE
===================== */

async function saveApplication() {

    const editId =
        document.getElementById("editId").value;

    let resumeUrl = currentResumeUrl;

    const file =
        document.getElementById("resumeFile").files[0];

    if (file) {

        const fileName =
            Date.now() + "_" + file.name;

        const { error: uploadError } =
            await client.storage
                .from("resumes")
                .upload(fileName, file);

        if (uploadError) {
            alert(uploadError.message);
            return;
        }

        const { data } =
            client.storage
                .from("resumes")
                .getPublicUrl(fileName);

        resumeUrl =
            data.publicUrl;
    }

    const user =
        JSON.parse(localStorage.getItem("user"));

    const applicationData = {

        user_id: user.id,

        company_name:
            document.getElementById("company").value,

        role:
            document.getElementById("role").value,

        status:
            document.getElementById("status").value,

        notes:
            document.getElementById("notes").value,

        date_applied:
            document.getElementById("dateApplied").value,

        interview_date:
            document.getElementById("interviewDate").value,

        resume_url:
            resumeUrl
    };

    let response;

    if (editId) {

        response = await client
            .from("applications")
            .update(applicationData)
            .eq("id", editId);

    } else {

        response = await client
            .from("applications")
            .insert([applicationData]);

    }

    if (response.error) {

        alert(response.error.message);

    } else {

        resetForm();
        loadApplications();

    }
}

/* =====================
   LOAD DATA
===================== */

async function loadApplications() {

    const user =
        JSON.parse(localStorage.getItem("user"));

    const search =
        document.getElementById("searchBox")
            ?.value || "";

    let query = client
        .from("applications")
        .select("*")
        .eq("user_id", user.id);

    if (search) {

        query = query.ilike(
            "company_name",
            `%${search}%`
        );
    }

    const { data, error } =
        await query;

    if (error) {
        console.log(error);
        return;
    }

    const table =
        document.getElementById(
            "applicationTable"
        );

    table.innerHTML = "";

    let applied = 0;
    let selected = 0;
    let rejected = 0;

    data.forEach(app => {

        if (app.status === "Applied")
            applied++;

        if (app.status === "Selected")
            selected++;

        if (app.status === "Rejected")
            rejected++;

        table.innerHTML += `

        <tr>

            <td>${app.company_name}</td>

            <td>${app.role}</td>

            <td>
                <span class="${app.status.replace(/\s+/g,'')}">
                    ${app.status}
                </span>
            </td>

            <td>
                ${app.date_applied || "-"}
            </td>

            <td>
                ${app.interview_date || "-"}
            </td>

            <td>

                ${
                    app.resume_url
                    ?
                    `<a href="${app.resume_url}"
                       target="_blank">
                       View
                     </a>`
                    :
                    "-"
                }

            </td>

            <td>

                <button
                    onclick="editApplication('${app.id}')">

                    Edit

                </button>

                <button
                    onclick="deleteApplication('${app.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;
    });

    document.getElementById(
        "totalApps"
    ).innerText = data.length;

    document.getElementById(
        "appliedCount"
    ).innerText = applied;

    document.getElementById(
        "selectedCount"
    ).innerText = selected;

    document.getElementById(
        "rejectedCount"
    ).innerText = rejected;
}

/* =====================
   EDIT
===================== */

async function editApplication(id) {

    const { data, error } =
        await client
            .from("applications")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById(
        "editId"
    ).value = data.id;

    document.getElementById(
        "company"
    ).value = data.company_name;

    document.getElementById(
        "role"
    ).value = data.role;

    document.getElementById(
        "status"
    ).value = data.status;

    document.getElementById(
        "notes"
    ).value = data.notes;

    document.getElementById(
        "dateApplied"
    ).value = data.date_applied;

    document.getElementById(
        "interviewDate"
    ).value = data.interview_date;

    currentResumeUrl =
        data.resume_url;
}

/* =====================
   DELETE
===================== */

async function deleteApplication(id) {

    const confirmDelete =
        confirm(
            "Delete this application?"
        );

    if (!confirmDelete)
        return;

    const { error } =
        await client
            .from("applications")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

    } else {

        loadApplications();

    }
}

/* =====================
   RESET
===================== */

function resetForm() {

    document.getElementById(
        "editId"
    ).value = "";

    document.getElementById(
        "company"
    ).value = "";

    document.getElementById(
        "role"
    ).value = "";

    document.getElementById(
        "notes"
    ).value = "";

    document.getElementById(
        "dateApplied"
    ).value = "";

    document.getElementById(
        "interviewDate"
    ).value = "";

    document.getElementById(
        "resumeFile"
    ).value = "";

    currentResumeUrl = "";
}

/* =====================
   LOGOUT
===================== */

async function logout() {

    await client.auth.signOut();

    localStorage.removeItem("user");

    window.location.href =
        "index.html";
}

/* =====================
   INITIAL LOAD
===================== */

loadApplications();