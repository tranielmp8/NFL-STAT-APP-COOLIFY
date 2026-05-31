<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageServerData } from './$types';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	const seasonOptions = [2025, 2026, 2027, 2028];
	const seasonTypes = [
		{ value: 'preseason', label: 'Preseason' },
		{ value: 'regular', label: 'Regular' },
		{ value: 'postseason', label: 'Postseason' }
	];

	const activeLabel = $derived(`${data.settings.currentSeason} ${data.settings.currentSeasonType}`);
</script>

<svelte:head>
	<title>Admin Settings | GridIron</title>
</svelte:head>

<main class="min-h-screen bg-[#0d0f14] px-4 py-8 text-[#f0f2f5]">
	<section class="mx-auto max-w-5xl">
		<header
			class="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end"
		>
			<div>
				<nav class="flex flex-wrap gap-2" aria-label="Admin navigation">
					<a
						href="/"
						class="border border-white/10 bg-[#161921] px-4 py-2 text-sm font-black tracking-wide text-[#c6cad3] uppercase transition hover:border-white/25 hover:bg-[#1f2430] hover:text-white"
					>
						Teams
					</a>
					<a
						href="/admin/settings"
						aria-current="page"
						class="border border-[#f5a623]/40 bg-[#f5a623]/15 px-4 py-2 text-sm font-black tracking-wide text-[#f5a623] uppercase"
					>
						Settings
					</a>
					<a
						href="/admin/data-sync"
						class="border border-white/10 bg-[#161921] px-4 py-2 text-sm font-black tracking-wide text-[#c6cad3] uppercase transition hover:border-white/25 hover:bg-[#1f2430] hover:text-white"
					>
						Data Sync
					</a>
				</nav>
				<h1 class="mt-6 text-3xl font-black md:text-4xl">Admin Settings</h1>
				<p class="mt-2 max-w-2xl text-sm leading-6 text-[#aeb4c0]">
					Control which NFL season the team pages and player pages use by default.
				</p>
			</div>

			<div class="border border-white/10 bg-[#161921] px-4 py-3">
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Active Season</div>
				<div class="mt-1 text-2xl font-black text-[#f5a623]">{activeLabel}</div>
			</div>
		</header>

		<div class="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
			<section class="border border-white/10 bg-[#161921] p-5">
				<h2 class="text-lg font-black">Season Control</h2>
				<p class="mt-2 text-sm leading-6 text-[#aeb4c0]">
					Switching this does not delete prior years. It only changes which season is shown as the
					default experience.
				</p>

				<form class="mt-6 space-y-5" method="post" action="?/updateSeason" use:enhance>
					<label class="block">
						<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase">Season</span>
						<select
							class="mt-2 w-full border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
							name="season"
						>
							{#each seasonOptions as season}
								<option value={season} selected={season === data.settings.currentSeason}
									>{season}</option
								>
							{/each}
						</select>
					</label>

					<label class="block">
						<span class="text-xs font-black tracking-widest text-[#8a909e] uppercase"
							>Season Type</span
						>
						<select
							class="mt-2 w-full border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
							name="seasonType"
						>
							{#each seasonTypes as type}
								<option
									value={type.value}
									selected={type.value === data.settings.currentSeasonType}
								>
									{type.label}
								</option>
							{/each}
						</select>
					</label>

					<button
						class="w-full bg-[#f5a623] px-4 py-3 font-black text-[#11151d] transition hover:bg-[#ffbd4a]"
					>
						Save Active Season
					</button>
				</form>

				{#if form?.message}
					<div
						class="mt-4 border border-[#f5a623]/30 bg-[#f5a623]/10 p-3 text-sm font-bold text-[#f5a623]"
					>
						{form.message}
					</div>
				{/if}
			</section>

			<section class="border border-white/10 bg-[#161921] p-5">
				<div class="flex items-center justify-between gap-4">
					<div>
						<h2 class="text-lg font-black">History Data</h2>
						<p class="mt-1 text-sm text-[#8a909e]">Seasons currently present in the database.</p>
					</div>
					<div class="text-right text-xs font-black tracking-widest text-[#8a909e] uppercase">
						{data.history.length} season sets
					</div>
				</div>

				{#if data.history.length}
					<div class="mt-5 overflow-x-auto">
						<table class="w-full min-w-[520px] text-left text-sm">
							<thead
								class="border-b border-white/10 text-xs font-black tracking-widest text-[#8a909e] uppercase"
							>
								<tr>
									<th class="py-3 pr-4">Season</th>
									<th class="py-3 pr-4">Type</th>
									<th class="py-3 pr-4">Player Stat Rows</th>
									<th class="py-3 pr-4">Scheduled Games</th>
									<th class="py-3">Status</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-white/10">
								{#each data.history as row}
									<tr>
										<td class="py-4 pr-4 font-black text-white">{row.season}</td>
										<td class="py-4 pr-4 text-[#c6cad3] capitalize">{row.seasonType}</td>
										<td class="py-4 pr-4 text-[#c6cad3]">{row.statRows}</td>
										<td class="py-4 pr-4 text-[#c6cad3]">{row.scheduledGames}</td>
										<td class="py-4">
											{#if row.season === data.settings.currentSeason && row.seasonType === data.settings.currentSeasonType}
												<span
													class="border border-[#f5a623]/30 bg-[#f5a623]/10 px-2 py-1 text-xs font-black tracking-widest text-[#f5a623] uppercase"
												>
													Active
												</span>
											{:else}
												<span class="text-xs font-bold tracking-widest text-[#8a909e] uppercase"
													>Historical</span
												>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="mt-5 border border-white/10 bg-[#0d0f14] p-5 text-sm text-[#aeb4c0]">
						No stat history has been synced yet. Run the roster/stat sync for a season to populate
						this table.
					</div>
				{/if}
			</section>
		</div>

		<section class="mt-8 border border-white/10 bg-[#161921] p-5">
			<div class="flex flex-col justify-between gap-3 md:flex-row md:items-end">
				<div>
					<h2 class="text-lg font-black">Admin Users</h2>
					<p class="mt-1 text-sm text-[#8a909e]">
						Promote trusted accounts after they sign in once. Your own admin access is protected.
					</p>
				</div>
				<div class="text-xs font-black tracking-widest text-[#8a909e] uppercase">
					{data.users.length} users
				</div>
			</div>

			{#if data.users.length}
				<div class="mt-5 overflow-x-auto">
					<table class="w-full min-w-[720px] text-left text-sm">
						<thead
							class="border-b border-white/10 text-xs font-black tracking-widest text-[#8a909e] uppercase"
						>
							<tr>
								<th class="py-3 pr-4">User</th>
								<th class="py-3 pr-4">Role</th>
								<th class="py-3 pr-4">Joined</th>
								<th class="py-3">Update</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-white/10">
							{#each data.users as appUser}
								<tr>
									<td class="py-4 pr-4">
										<div class="font-black text-white">{appUser.name}</div>
										<div class="text-xs text-[#8a909e]">{appUser.email}</div>
									</td>
									<td class="py-4 pr-4">
										<span
											class={[
												'px-2 py-1 text-xs font-black tracking-widest uppercase',
												appUser.role === 'admin'
													? 'border border-[#f5a623]/30 bg-[#f5a623]/10 text-[#f5a623]'
													: 'border border-white/10 bg-[#0d0f14] text-[#aeb4c0]'
											]}
										>
											{appUser.role}
										</span>
									</td>
									<td class="py-4 pr-4 text-[#c6cad3]">
										{new Date(appUser.createdAt).toLocaleDateString()}
									</td>
									<td class="py-4">
										<form
											class="flex items-center gap-3"
											method="post"
											action="?/updateUserRole"
											use:enhance
										>
											<input name="userId" type="hidden" value={appUser.id} />
											<select
												class="w-36 border-white/10 bg-[#0d0f14] text-white focus:border-[#f5a623] focus:ring-[#f5a623]"
												name="role"
												disabled={appUser.id === data.user.id}
											>
												<option value="user" selected={appUser.role !== 'admin'}>User</option>
												<option value="admin" selected={appUser.role === 'admin'}>Admin</option>
											</select>
											<button
												class="bg-[#f5a623] px-4 py-2 text-xs font-black text-[#11151d] transition hover:bg-[#ffbd4a] disabled:cursor-not-allowed disabled:opacity-50"
												disabled={appUser.id === data.user.id}
											>
												Save
											</button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="mt-5 border border-white/10 bg-[#0d0f14] p-5 text-sm text-[#aeb4c0]">
					No users have signed in yet.
				</div>
			{/if}
		</section>
	</section>
</main>
