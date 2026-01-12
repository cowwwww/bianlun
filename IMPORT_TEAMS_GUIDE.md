# 📊 Import Teams from Excel Guide

## ✅ Scripts Created

1. **`preview-excel.js`** - Preview Excel file structure
2. **`import-teams-from-excel.js`** - Import teams into PocketBase

---

## 🚀 Quick Start

### Step 1: Preview Excel File

```bash
node preview-excel.js "编号 (1).xlsx"
```

This will show you:
- Column names
- First 3 rows as examples
- Data structure

### Step 2: Import Teams

```bash
node import-teams-from-excel.js [POCKETBASE_URL] [TOURNAMENT_ID] [EXCEL_FILE]
```

**Example:**
```bash
# Local PocketBase
node import-teams-from-excel.js http://127.0.0.1:8090 tournament-id-here "编号 (1).xlsx"

# Railway PocketBase
node import-teams-from-excel.js https://pocketbase-railway-production-d9aa.up.railway.app tournament-id-here "编号 (1).xlsx"
```

The script will:
- Ask for Tournament ID if not provided
- Show you the data structure
- Ask for confirmation before importing
- Import all teams and members

---

## 📋 Data Structure

The script expects Excel columns:
- **`1.队伍名称`** - Team name
- **`3.选项二：请按照以下格式提交申请`** - First member (leader)
- **`__EMPTY`, `__EMPTY_1`, `__EMPTY_2`, etc.** - Additional members
- **`4.是否需要代请评委`** - Whether they need a judge

**Member Format:**
```
Name, School, Year, Contact, Experience
```

**Example:**
```
黄华（领队）,福建江夏学院,2023,13313955607
叶宇亮（随评）,广西外国语学院,2022级,y2846586486,经验...
```

---

## 🎯 随评 (Accompanying Judge) Logic

The script automatically detects if the second member should be marked as "accompanying_judge":

### Condition 1: Name contains "（随评）"
If a member's name contains "（随评）" or "(随评)", they are marked as `accompanying_judge`.

**Example:**
```
叶宇亮（随评） → role: "accompanying_judge"
```

### Condition 2: "4.是否需要代请评委" says "不需要"
If the field "4.是否需要代请评委" contains "不需要", then the **second member** (first `__EMPTY` column) is automatically marked as `accompanying_judge`.

**Example:**
```
4.是否需要代请评委: 不需要
→ Second member becomes accompanying_judge
```

---

## 📝 What Gets Imported

### Registration Record
- `tournamentId` - Tournament ID
- `teamName` - Team name from Excel
- `participants` - Array of member names
- `contact` - Contact info from first member
- `status` - Set to "approved"
- `paymentStatus` - Set to "paid"

### Team Member Records
For each member:
- `registrationId` - Links to registration
- `tournamentId` - Tournament ID
- `name` - Member name (cleaned, without 随评 marker)
- `role` - "leader", "accompanying_judge", or "member"
- `school` - School name
- `year` - Year/grade
- `contact` - Contact info
- `experience` - Experience/background
- `isCompeting` - true for leader/member, false for accompanying_judge

---

## 🔍 Example Output

```
📝 Row 1: Creating registration for: 显允—啊！打～
   Members: 12
   Accompanying Judge: None
   ✅ Registration created: abc123
   ✅ Member added: 黄华 (leader)
   ✅ Member added: 刘畅 (member)
   ✅ Member added: 吴昊森 (member)
   ...

📝 Row 2: Creating registration for: 橙子酱队
   Members: 6
   Accompanying Judge: 叶宇亮
   ✅ Registration created: def456
   ✅ Member added: 冯文静 (leader)
   ✅ Member added: 叶宇亮 (accompanying_judge)
   ✅ Member added: 施少坦 (member)
   ...
```

---

## ⚠️ Important Notes

1. **Tournament ID**: You need the Tournament ID from PocketBase. Get it from:
   - Admin Dashboard → Collections → tournaments
   - Or from the URL when viewing a tournament

2. **Duplicate Teams**: The script will create new registrations even if teams already exist. Check for duplicates before importing.

3. **Member Parsing**: The script parses members from the format:
   ```
   Name, School, Year, Contact, Experience
   ```
   If the format is different, you may need to adjust the script.

4. **随评 Detection**: The script checks:
   - If name contains "（随评）" → that member is accompanying_judge
   - If "4.是否需要代请评委" = "不需要" → second member is accompanying_judge

---

## 🧪 Testing

Before importing all data, test with a few rows:

1. **Preview the file** to see structure
2. **Test import** with a small subset
3. **Check PocketBase** to verify data
4. **Import all** if everything looks good

---

## 🐛 Troubleshooting

### "No team name found"
- Check that column "1.队伍名称" exists
- Verify Excel file format

### "No team members found"
- Check that "3.选项二：请按照以下格式提交申请" has data
- Verify member format is correct

### "Invalid tournament ID"
- Get the correct Tournament ID from PocketBase admin
- Make sure the tournament exists

### Import errors
- Check PocketBase is running
- Verify API rules allow creating registrations/team_members
- Check network connection

---

## 📚 Next Steps

After importing:
1. ✅ Verify teams in Admin Dashboard
2. ✅ Check team members are correctly assigned
3. ✅ Verify 随评 members have correct role
4. ✅ Test tournament functionality

---

**Ready to import?** Run:
```bash
node import-teams-from-excel.js http://127.0.0.1:8090 YOUR_TOURNAMENT_ID "编号 (1).xlsx"
```

