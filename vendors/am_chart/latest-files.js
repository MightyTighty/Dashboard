
    document.addEventListener('DOMContentLoaded', function () {
    const latestFilesContainer = document.querySelector('.white_card_body');
    const filterDropdown = document.querySelector('.nice_Select2');

    // Fetch user files
    async function fetchUserFiles() {
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                alert('You are not logged in.');
                return [];
            }

            const response = await fetch('http://127.0.0.1:8000/api/user-files/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch files.');

            return await response.json();
        } catch (error) {
            console.error('Error fetching files:', error);
            return [];
        }
    }

    // Populate files in the container
    function populateFiles(files) {
        latestFilesContainer.innerHTML = ''; // Clear existing content
        if (files.length === 0) {
            latestFilesContainer.innerHTML = '<p>No files found.</p>';
            return;
        }
        const latestFiles = files.slice(0, 4); // Show only the latest 4 files

        files.forEach((file) => {
            const fileRow = `
                <div class="single_user_pil d-flex align-items-center justify-content-between">
                    <div class="user_pils_thumb d-flex align-items-center">
                        <div class="thumb_34 mr_15 mt-0">
                            <img class="img-fluid radius_50" src="img/files/audio-icon.png" alt="File Icon">
                        </div>
                        <div class="text_truncate">
                            <span class="f_s_14 f_w_400 text_color_11">${file.file_name}</span>
                            <p class="f_s_12 f_w_400 text_color_6">
                                Uploaded: ${file.created_at} | Duration: ${file.file_duration}s
                            </p>
                        </div>
                    </div>
                    <div class="action_btns d-flex">
                        <button class="action_btn mr_10 ${file.result === 'Real' ? 'btn_real' : 'btn_fake'}">
                            ${file.result === 'Real' ? 'R' : 'F'}
                        </button>
                        <a href="${file.file_path}" class="action_btn" download> <i class="fas fa-download"></i> </a>
                    </div>
                </div>
            `;
            latestFilesContainer.insertAdjacentHTML('beforeend', fileRow);
        });
    }

    // Sort and filter files
    function sortAndFilterFiles(files, filter) {
        const filteredFiles = filter === 'all' ? files : files.filter((file) => file.result.toLowerCase() === filter);
        return filteredFiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by date (descending)
    }

    // Handle dropdown filter change
    filterDropdown.addEventListener('change', async function (event) {
        const filter = event.target.value.toLowerCase();
        try {
            const files = await fetchUserFiles();
            if (!files) return;
            const filteredFiles = sortAndFilterFiles(files, filter);
            populateFiles(filteredFiles);
        } catch (error) {
            console.error('Error filtering files:', error);
        }
    });

    // Initial load
    async function init() {
        try {
            const files = await fetchUserFiles();
            if (files) populateFiles(sortAndFilterFiles(files, 'all')); // Default sort by date
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    init();
});


