# Performance Testing Guide for Habit Battles

This guide will help you test and verify the performance metrics claimed in your resume:
> **"Delivered real-time UX with 220 ms median write → UI refresh and p95 < 1.0 s during user check-ins by subscribing to Supabase Postgres change feeds and batching list refreshes."**

## 🎯 What We're Testing

- **Write → UI Refresh Time**: Time from database write (check-in) to UI update
- **Median Performance**: Target < 220ms
- **P95 Performance**: Target < 1000ms (1.0s)
- **Real-time Updates**: Supabase Postgres change feed subscription performance

## 🚀 Quick Start Testing

### 1. Install Dependencies
```bash
npm install
npm install --save-dev puppeteer
```

### 2. Start Your App
```bash
npm run dev
```

### 3. Manual Testing with Built-in Performance Tracker
1. Navigate to `/habits` page
2. Scroll down to see the "Performance Metrics Tester" section
3. Click "Start Test"
4. Perform habit check-ins (click "Check in" buttons)
5. Watch real-time metrics update
6. Click "Stop Test" to see final results

## 🔬 Automated Performance Testing

### Run Full Performance Test Suite
```bash
npm run test:performance
```

This will:
- Launch automated browser tests
- Measure multiple check-in operations
- Generate comprehensive performance report
- Save detailed results to `performance-test-results.json`

### Headless Testing (for CI/CD)
```bash
npm run test:performance:headless
```

## 📊 Understanding the Metrics

### What Each Metric Means

- **Median**: 50th percentile - half of operations are faster, half are slower
- **P95**: 95th percentile - 95% of operations are faster than this value
- **Mean**: Average performance across all measurements
- **Min/Max**: Best and worst case performance

### Your Resume Claims vs. Reality

| Metric | Claim | Target | How to Verify |
|--------|-------|---------|---------------|
| Median | < 220ms | ✅ | Built-in tracker shows real-time results |
| P95 | < 1000ms | ✅ | Automated tests measure across many samples |
| Real-time | Supabase change feeds | ✅ | Watch UI update immediately after check-in |

## 🧪 Testing Scenarios

### 1. Single User Performance
- **Setup**: One user, multiple habits
- **Test**: Perform 10-20 check-ins
- **Measure**: Individual operation latency
- **Expected**: Median < 220ms, P95 < 1000ms

### 2. Concurrent User Performance
- **Setup**: Multiple browser tabs/users
- **Test**: Simultaneous check-ins
- **Measure**: System performance under load
- **Expected**: Maintain performance targets

### 3. Network Conditions
- **Setup**: Use browser dev tools to simulate slow network
- **Test**: Check-ins with 3G/4G simulation
- **Measure**: Performance degradation
- **Expected**: Graceful degradation, still under targets

## 📈 How to Interpret Results

### ✅ PASS Criteria
- **Median < 220ms**: Your app consistently delivers fast updates
- **P95 < 1000ms**: 95% of users experience sub-second performance
- **Real-time updates**: UI refreshes immediately after database changes

### ❌ FAIL Criteria
- **Median > 220ms**: Need to optimize database queries or UI updates
- **P95 > 1000ms**: Performance bottlenecks affecting user experience
- **Delayed updates**: Real-time subscriptions not working properly

## 🔍 Troubleshooting Common Issues

### High Latency (>500ms)
1. **Check Supabase connection**: Verify real-time subscriptions are active
2. **Database indexes**: Ensure proper indexing on `checkins` table
3. **Network latency**: Test from different locations
4. **Browser performance**: Check for memory leaks or heavy JavaScript

### Inconsistent Results
1. **Clear browser cache**: Disable caching during testing
2. **Stable network**: Use consistent internet connection
3. **Multiple samples**: Run tests multiple times for statistical significance
4. **Background processes**: Close unnecessary browser tabs/apps

## 📝 Recording Results for Resume

### What to Document
1. **Test Environment**: Browser, device, network conditions
2. **Sample Size**: Number of measurements taken
3. **Results**: Actual median and P95 values achieved
4. **Date**: When testing was performed
5. **Methodology**: How measurements were taken

### Example Resume Bullet
```
• Delivered real-time UX with 180ms median write→UI refresh and p95 < 800ms 
  during user check-ins by subscribing to Supabase Postgres change feeds and 
  batching list refreshes (tested with 50+ measurements across multiple users)
```

## 🚀 Advanced Testing

### Load Testing
- Use tools like Artillery or k6 for high-volume testing
- Test with 100+ concurrent users
- Measure performance degradation under load

### Cross-Platform Testing
- Test on different devices (mobile, tablet, desktop)
- Test on different browsers (Chrome, Firefox, Safari)
- Test on different network conditions

### Database Performance
- Monitor Supabase query performance
- Check real-time subscription latency
- Verify change feed delivery times

## 🎉 Success Criteria

Your performance testing is successful when:
1. ✅ Median write→UI refresh < 220ms
2. ✅ P95 performance < 1000ms
3. ✅ Real-time updates work consistently
4. ✅ Performance remains stable under load
5. ✅ Results are reproducible across multiple test runs

## 📞 Getting Help

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase real-time subscriptions are active
3. Check network tab for failed requests
4. Review the performance tracker output
5. Run automated tests to isolate issues

---

**Remember**: These metrics demonstrate your ability to build performant, real-time applications. They're valuable for showing technical competency in your resume and interviews!
