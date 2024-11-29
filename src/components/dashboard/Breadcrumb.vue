<script setup>

const props = defineProps({
  first: String,
  second: String,
  third: String,
  firstIcon: String,
  secondIcon: String,
  thirdIcon: String,
  link: String
});
</script>


<template>
    <div class="breadcrumbs text-sm flex justify-start w-[80%]">
        <ul class="flex flex-wrap">
            <li>
                <RouterLink :to="link" class="inline-flex items-center gap-2 dark:text-gray-300">
                    <span v-html="props.firstIcon"></span>
                    {{first}}
                </RouterLink>
            </li>
            <li>
                <span class="inline-flex items-center gap-2 dark:text-gray-300">
                    <span v-html="props.secondIcon"></span>
                    {{second}}
                </span>
            </li>
            <li v-if="props.third">
                <span class="inline-flex items-center gap-2 dark:text-gray-300">
                    <span v-html="props.thirdIcon"></span>
                    {{third}}
                </span>
            </li>
        </ul>
    </div>
</template>