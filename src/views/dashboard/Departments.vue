<script setup>
import SideBar from '../../components/dashboard/SideBar.vue';
import Header from '../../components/dashboard/Header.vue';
import Breadcrumb from '../../components/dashboard/Breadcrumb.vue';
import { onMounted, ref, computed, watch } from 'vue';
import { useSideBar } from '../../stores/sideBar';
import axios, { all } from 'axios';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'vue-sonner';
import { useDepartments } from '../../stores/departments';
import DepartmentsPagination from '../../components/dashboard/DepartmentsPagination.vue';
import SearchDepartmentsPagination from '../../components/dashboard/SearchDepartmentsPagination.vue';

const department = useDepartments()
const departments = computed(() => department.defaultData)
const sideBar = useSideBar()


onMounted(() => {
    sideBar.isResourcesExpanded = true
})


const searchQuery = ref('')
const sortKey = ref('');
const sortOrder = ref(1);

const searchedDepartments = computed(() => {
    let filteredDepartments = department.searchedDepartments || [];
    if (sortKey.value) {
        filteredDepartments.sort((a, b) => {
            const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
            const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }
    return filteredDepartments;
});

watch(() => searchQuery.value, async () => {
    if (searchQuery.value < 1) {
        await department.fetchDepartments()
    }
})

const captureSearchQuery = async () => {
    await department.fetchSearchedDepartments(1, searchQuery.value)
    searchedDepartments.value = department.searchedDepartments
    return searchedDepartments.value
}


const filteredAndSortedDepartments = computed(() => {
    const filteredDepartments = departments.value || []
    if (sortKey.value) {
        filteredDepartments.sort((a, b) => {
            const aValue = a[sortKey.value] || ''; // Default to empty string if null or undefined
            const bValue = b[sortKey.value] || ''; // Default to empty string if null or undefined
            const result = aValue.localeCompare(bValue);
            return result * sortOrder.value;
        });
    }
    return filteredDepartments;
});


const sortBy = (key) => {
    if (sortKey.value === key) {
        sortOrder.value = -sortOrder.value;
    } else {
        sortKey.value = key;
        sortOrder.value = 1;
    }
};

const getSortIcon = (key) => {
    if (sortKey.value !== key) return '';
    return sortOrder.value === 1 ? '▲' : '▼';
};



async function exportToExcel() {
    const departments = ref([])
    try {
        await axios.get('/fetch-all-departments').then((res) => {
            departments.value = res.data.departments
        }).catch((err) => {
            console.log(err)
        })
    }
    catch (error) {
        console.log(error)
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the array of objects to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(departments.value);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'departments.xlsx');
}

const showAddDepartmentModel = () => {
    name.value = null
    slug.value = null
    description.value = null
    const modal = document.getElementById('my_modal_2')
    modal.showModal()
}

const updateDeletedDepartmentLocally = (departmentId) => {
    const departmentIndexInDefaultArray = filteredAndSortedDepartments.value.findIndex(department => department.id === departmentId)
    const departmentIndexInSearchedDepartments = searchedDepartments.value.findIndex(department => department.id === departmentId)

    if (departmentIndexInDefaultArray !== -1) {
        filteredAndSortedDepartments.value.splice(departmentIndexInDefaultArray, 1)
    }
    if (departmentIndexInSearchedDepartments !== -1) {
        searchedDepartments.value.splice(departmentIndexInSearchedDepartments, 1)
    }
}


const departmentToDelete = ref(null)
const deleteDepartmentConfirmation = (departmentId) => {
    departmentToDelete.value = departmentId
    const modal = document.getElementById('modal_delete_department_confirmation')
    modal.showModal()
}
const showDeleteConfirmationModal = ref(true)
const deleteDepartment = async () => {
    try {
        const res = await axios.get('/delete-department', {
            params: {
                department_id: departmentToDelete.value
            }
        });

        showDeleteConfirmationModal.value = false
        toast.success('Success', {
            description: res.data.message,
            duration: 5000,
        });
        updateDeletedDepartmentLocally(departmentToDelete.value)
        await new Promise(resolve => setTimeout(resolve, 500));
        showDeleteConfirmationModal.value = true
    } catch (error) {
        showDeleteConfirmationModal.value = false;
        toast.error('Error', {
            description: 'error',
            duration: 5000,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        showDeleteConfirmationModal.value = true

        console.log(error);
    }
}

const showAddDepartmentModal = ref(true)
const name = ref('')
const slug = ref('')
const description = ref('')

const addDepartment = async () => {
    const button = document.getElementById('addDepartment-button')
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>'
    await new Promise(resolve => setTimeout(resolve, 2000))
    try {
        await axios.post('/add-department', {
            name: name.value,
            slug: slug.value,
            description: description.value
        }).then(async (res) => {
            toast.success(res.data.message)
            showAddDepartmentModal.value = false
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddDepartmentModal.value = true
            const objectToAdd = {
                id: res.data.newDepartment.id,
                name: res.data.newDepartment.name,
                slug: res.data.newDepartment.slug,
                desc: res.data.newDepartment.desc
            }
            departments.value.push(objectToAdd)
            if (searchedDepartments.value) {
                searchedDepartments.value.push(objectToAdd)
            }
        }).catch(async (error) => {
            toast.error(error.response.data.error)
            showAddDepartmentModal.value = false
            await new Promise(resolve => setTimeout(resolve, 500));
            showAddDepartmentModal.value = true

        })
    }
    catch (error) {
        console.log(error)
        toast.error(error)
        showAddDepartmentModal.value = false
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddDepartmentModal.value = true

    }
    button.innerHTML = 'Add Department'
}

const showEditDepartmentModal = ref(true)
const editableDepartmentId = ref(null)

const showEditDepartmentModalFunc = (department) => {
    const modal = document.getElementById('my_edit_modal')
    editableDepartmentId.value = department.id
    name.value = department.name
    slug.value = department.slug
    description.value = department.desc
    modal.showModal()
}

const editDepartment = async () => {
    const button = document.getElementById('editDepartment-button')
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>'
    await new Promise(resolve => setTimeout(resolve, 2000))
    try {
        await axios.post('/edit-department', {
            department_id: editableDepartmentId.value,
            name: name.value,
            slug: slug.value,
            desc: description.value
        }).then(async (res) => {
            toast.success(res.data.message)
            showEditDepartmentModal.value = false
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditDepartmentModal.value = true
            updateDepartmentDetailsLocally(editableDepartmentId.value, name.value, slug.value, description.value)
        }).catch(async (error) => {
            toast.error(error.message)
            showEditDepartmentModal.value = false
            await new Promise(resolve => setTimeout(resolve, 500));
            showEditDepartmentModal.value = true

        })
    }
    catch (error) {
        console.log(error)
        toast.error(error)
        showAddDepartmentModal.value = false
        await new Promise(resolve => setTimeout(resolve, 500));
        showAddDepartmentModal.value = true

    }
    button.innerHTML = 'Add Department'
}


const updateDepartmentDetailsLocally = (departmentId, name, slug, description) => {
    const departmentIndexInDefaultArray = filteredAndSortedDepartments.value.find(department => department.id === departmentId)
    const departmentIndexInSearchedDepartments = searchedDepartments.value.find(department => department.id === departmentId)

    if (departmentIndexInDefaultArray) {
        departmentIndexInDefaultArray.name = name
        departmentIndexInDefaultArray.slug = slug
        departmentIndexInDefaultArray.desc = description
    }
    if (departmentIndexInSearchedDepartments) {
        departmentIndexInSearchedDepartments.name = name
        departmentIndexInSearchedDepartments.slug = slug
        departmentIndexInSearchedDepartments.desc = description
    }
}
</script>


<template>
    <div class=" bg-[#F0F5F9] dark:bg-darkmodebg flex min-h-screen">
        <Toaster richColors position="top-right" />
        <SideBar />
        <div class="flex items-center w-full min-[1025px]:w-[75%] flex-col gap-3">
            <Header />

            <Breadcrumb first="Dashboard" second="Monitor Hospital" third="Departments"
                firstIcon='<i class="fa-solid fa-gauge"></i>' secondIcon='<i class="fa-solid fa-circle-h"></i>'
                thirdIcon='<i class="fa-solid fa-building"></i>' link="/admin-dashboard" />


            <!-- Table -->
            <div class="w-[80%] bg-white dark:bg-darkmodebg max-[1025px]:w-[90%] p-4 mt-10 rounded-3xl">
                <!-- Search -->
                <div class="flex justify-between mb-4 gap-3 flex-col sm:flex-row">
                    <input type="text" @input="captureSearchQuery" v-model="searchQuery" placeholder="Search..."
                        class="input input-bordered w-full dark:bg-slate-800 dark:text-gray-300" />
                    <button @click="showAddDepartmentModel()"
                        class="bg-primarycolor text-white rounded-lg p-4 text-sm hover:bg-blue-500 font-semibold w-full">Add
                        Department</button>
                    <button @click="exportToExcel()" class="btn btn-primary flex items-center">
                        <i class="fas fa-file-excel mr-2"></i>
                        Download Excel
                    </button>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto custom-scrollbar">
                    <table class="table w-full">
                        <!-- head -->
                        <thead>
                            <tr>
                                <th @click="sortBy('name')" class="cursor-pointer dark:text-gray-300">
                                    Department Name
                                    <span>{{ getSortIcon('name') }}</span>
                                </th>
                                <th @click="sortBy('slug')" class="cursor-pointer dark:text-gray-300">
                                    Slug
                                    <span>{{ getSortIcon('slug') }}</span>
                                </th>
                                <th @click="sortBy('description')" class="cursor-pointer dark:text-gray-300">
                                    Description
                                    <span>{{ getSortIcon('description') }}</span>
                                </th>
                                <th class="dark:text-gray-300">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="searchQuery" v-for="department in searchedDepartments" :key="department.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ department.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ department.slug }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ department.desc }}
                                </td>
                                <td class="flex gap-2">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500 ml-2"
                                        @click="showEditDepartmentModalFunc(department)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteDepartmentConfirmation(department.id)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>



                            <tr v-else v-for="dep in filteredAndSortedDepartments" :key="dep.id">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="font-bold dark:text-gray-300">{{ dep.name }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ dep.slug }}
                                    <br />
                                </td>
                                <td class="dark:text-gray-300">
                                    {{ dep.desc }}
                                </td>
                                <td class="flex gap-2">
                                    <button class="btn border-none bg-primarycolor text-white hover:bg-blue-500"
                                        @click="showEditDepartmentModalFunc(dep)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                        @click="deleteDepartmentConfirmation(dep.id)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>


                            <!-- Add Modal -->
                            <dialog v-if="showAddDepartmentModal" id="my_modal_2" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Department Details</h3>
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Department Name</span>
                                            <input type="text" v-model="name"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Slug</span>
                                            <input type="text" v-model="slug"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Description</span>
                                            <textarea v-model="description"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>
                                    </div>
                                    <div class="modal-action">
                                        <button @click="addDepartment" id="addDepartment-button"
                                            class="bg-primarycolor font-semibold text-white rounded-lg p-3 w-36 h-12">Add
                                            Department</button>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">close</button>
                                </form>
                            </dialog>


                            <!-- Edit Modal -->
                            <dialog v-if="showEditDepartmentModal" id="my_edit_modal" class="modal">
                                <div class="modal-box dark:bg-slate-700">
                                    <div class="py-4 flex flex-col gap-3">
                                        <h3 class="text-lg font-bold dark:text-gray-300">Edit Department Details</h3>
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Department Name</span>
                                            <input type="text" v-model="name"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Slug</span>
                                            <input type="text" v-model="slug"
                                                class="input input-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300" />
                                        </label>
                                        <label class="form-control w-full max-w-xs">
                                            <span class="label-text dark:text-gray-300">Description</span>
                                            <textarea v-model="description"
                                                class="textarea textarea-bordered w-full max-w-xs mt-2 dark:bg-slate-800 dark:text-gray-300"></textarea>
                                        </label>
                                    </div>
                                    <div class="modal-action">
                                        <button @click="editDepartment" id="editDepartment-button"
                                            class="bg-primarycolor w-36 font-semibold text-white rounded-lg p-3">Update
                                            Department</button>
                                    </div>
                                </div>
                                <form method="dialog" class="modal-backdrop">
                                    <button @click="closeModal">close</button>
                                </form>
                            </dialog>



                            <!-- Modal Delete User Confirmation -->
                            <dialog v-if="showDeleteConfirmationModal" id="modal_delete_department_confirmation"
                                class="modal modal-middle">
                                <div class="modal-box dark:bg-slate-700">
                                    <h3 class="text-lg font-bold dark:text-gray-300">Confirm Delete Department</h3>
                                    <p class="py-4 text-red-600 font-semibold">Are you sure you want to delete the
                                        selected department?</p>
                                    <div class="modal-action">
                                        <button class="btn border-none bg-red-600 text-white hover:bg-red-500"
                                            @click="deleteDepartment">Yes</button>

                                        <form method="dialog">
                                            <button
                                                class="btn border-none text-gray-700 dark:bg-slate-400 dark:text-gray-1000">Close</button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>
                        </tbody>
                    </table>
                    <div v-if="!departments" class="animate-pulse w-full">
                        <div class="h-4 bg-gray-200 mt-3 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-300 mb-6 rounded"></div>
                        <div class="h-4 bg-gray-200 mb-6 rounded"></div>
                    </div>
                </div>
                <!-- Pagination -->
                <SearchDepartmentsPagination :searchQuery="searchQuery" v-if="searchQuery" />
                <DepartmentsPagination v-else />
            </div>



        </div>
    </div>



</template>

<style>
.custom-scrollbar {
    scrollbar-width: thin;
    /* For Firefox */
    scrollbar-color: #c5c2c2 #f1f1f1;
    /* For Firefox */
}

/* For Webkit browsers (Chrome, Safari) */
.custom-scrollbar::-webkit-scrollbar {
    width: 12px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px;
    border: 3px solid #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>