<template>
  <hero class="min-h-screen bg-base-200 flex flex-col justify-center items-center">
    <div class="hero-content text-center flex-col">
      
      <div class="max-w-md mb-10">
        <h1 class="text-5xl font-bold">Welcome to CO2 Ecosystem Hub</h1>
        <p class="py-6">Your gateway to managing and monitoring CO2 emissions effectively.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        
        <a href="/wallet" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer border border-base-300">
          <div class="card-body items-center text-center">
            <div class="p-4 bg-primary/10 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 class="card-title">My Wallet</h2>
            <p class="text-sm text-base-content/70">Manage your CO2 tokens and assets.</p>
            <div class="card-actions mt-4">
              <span class="btn btn-sm btn-primary">Open Wallet</span>
            </div>
          </div>
        </a>

        <a href="/shop" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer border border-base-300">
          <div class="card-body items-center text-center">
            <div class="p-4 bg-secondary/10 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 class="card-title">Carbon Fashion</h2>
            <p class="text-sm text-base-content/70">Shop sustainable fashion.</p>
            <div class="card-actions mt-4">
              <span class="btn btn-sm btn-secondary">Go to Shop</span>
            </div>
          </div>
        </a>

        <div class="card bg-base-100 shadow-sm border border-base-300 opacity-70 relative overflow-hidden">
          <div class="absolute top-3 right-3 badge badge-ghost">Coming Soon</div>
          <div class="card-body items-center text-center">
            <div class="p-4 bg-accent/10 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h2 class="card-title">Exchange</h2>
            <p class="text-sm text-base-content/70">Trade carbon credits instantly.</p>
            <div class="card-actions mt-4">
              <button class="btn btn-sm btn-disabled">Not Available</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </hero>
</template>

<script>
export default {

}
</script>

<style>

</style>