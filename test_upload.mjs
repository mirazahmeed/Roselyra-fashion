import fs from "fs";

async function testUpload() {
	const form = new FormData();
	// Create a dummy text file
	const blob = new Blob(["dummy content"], { type: "text/plain" });
	form.append("file", blob, "dummy.txt");

	try {
		const res = await fetch("http://localhost:3000/api/media/upload", {
			method: "POST",
			headers: {
				// I need a valid token to test, but wait! The endpoint uses requireEditor.
				// It checks cookies or auth headers.
			},
			body: form,
		});
		console.log(res.status, await res.text());
	} catch (err) {
		console.error(err);
	}
}

testUpload();
