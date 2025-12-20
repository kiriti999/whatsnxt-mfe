try {
    require('child_process').execSync('lefthook install', { stdio: 'inherit' });
} catch (e) {
    console.log('Lefthook install skipped (lefthook not found or failed)');
}
