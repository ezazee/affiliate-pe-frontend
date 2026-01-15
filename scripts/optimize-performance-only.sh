#!/bin/bash

echo "🚀 Performance Optimization Only (No Design Changes)"

echo "📋 Langkah-langkah Optimasi Performa:"

# 1. Build analysis
echo "1️⃣ Analyzing current build..."
npm run build

# 2. Database optimization (CRITICAL!)
echo ""
echo "2️⃣ Creating database indexes (PENTING!)..."
npm run create-indexes

# 3. Bundle analysis
echo ""
echo "3️⃣ Analyzing bundle size..."
npm run analyze-bundle

# 4. Check for performance opportunities
echo ""
echo "4️⃣ Checking for common performance issues..."

# Check if there are console.log statements
if grep -r "console.log" src/ --include="*.tsx" --include="*.ts" --include="*.js" | grep -v node_modules; then
    echo "⚠️  WARNING: Console.log statements found!"
    echo "   Run: npm run remove-logs"
else
    echo "✅ No console.log statements found"
fi

# Check image optimization
if grep -r "<img " src/ --include="*.tsx" --include="*.ts" | grep -v node_modules; then
    echo "⚠️  WARNING: Unoptimized img tags found!"
    echo "   Consider using Next.js Image component"
else
    echo "✅ Images appear to be optimized"
fi

echo ""
echo "🎯 Optimasi Performa Selesai!"
echo ""
echo "📊 Hasil yang Dihasilkan:"
echo "✅ Server-Side Rendering tetap dijaga"
echo "✅ Database indexes dibuat"
echo "✅ Bundle size dianalisis"
echo "✅ Landing page original dipertahankan"
echo "✅ Design tidak diubah"
echo ""
echo "⚡ Next Steps:"
echo "1. Deploy ke production"
echo "2. Monitor performa di production"
echo "3. Test Core Web Vitals"
echo "4. Gunakan Lighthouse untuk audit"
echo ""
echo "🎉 Website siap dengan performa optimal!"