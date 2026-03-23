import tkinter as tk
from tkinter import ttk, messagebox
import mysql.connector

# ---------------- DATABASE CONNECTION ----------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="KS70@manipal",
    database="hotel_management"
)
cursor = db.cursor()

# ---------------- FUNCTIONS ----------------

# -------- ADD GUEST --------
def add_guest_window():
    win = tk.Toplevel(root)
    win.title("Add Guest")
    win.geometry("300x250")

    tk.Label(win, text="Guest ID").pack()
    gid = tk.Entry(win); gid.pack()

    tk.Label(win, text="Name").pack()
    name = tk.Entry(win); name.pack()

    tk.Label(win, text="Phone").pack()
    phone = tk.Entry(win); phone.pack()

    def save():
        try:
            cursor.execute(
                "INSERT INTO Guest(guest_id,guest_name,phone) VALUES(%s,%s,%s)",
                (gid.get(), name.get(), phone.get())
            )
            db.commit()
            messagebox.showinfo("Success", "Guest Added!")
        except:
            messagebox.showerror("Error", "Invalid Data!")

    tk.Button(win, text="Save", bg="green", fg="white", command=save).pack(pady=10)


# -------- VIEW ROOMS --------
def view_rooms():
    win = tk.Toplevel(root)
    win.title("Available Rooms")
    win.geometry("500x300")

    tree = ttk.Treeview(win, columns=("Room No", "Type", "Price"), show='headings')
    tree.heading("Room No", text="Room No")
    tree.heading("Type", text="Type")
    tree.heading("Price", text="Price")
    tree.pack(fill="both", expand=True)

    cursor.execute("SELECT room_number, room_type, price_per_night FROM Room WHERE room_status='Available'")
    for row in cursor.fetchall():
        tree.insert("", tk.END, values=row)


# -------- MAKE RESERVATION --------
def reservation_window():
    win = tk.Toplevel(root)
    win.title("Reservation")
    win.geometry("300x300")

    tk.Label(win, text="Reservation ID").pack()
    rid = tk.Entry(win); rid.pack()

    tk.Label(win, text="Guest ID").pack()
    gid = tk.Entry(win); gid.pack()

    tk.Label(win, text="Room ID").pack()
    room = tk.Entry(win); room.pack()

    tk.Label(win, text="Check-in Date (YYYY-MM-DD)").pack()
    cin = tk.Entry(win); cin.pack()

    tk.Label(win, text="Check-out Date").pack()
    cout = tk.Entry(win); cout.pack()

    def reserve():
        try:
            cursor.execute(
                "INSERT INTO Reservation VALUES(%s,%s,%s,CURDATE(),%s,%s,'Booked')",
                (rid.get(), gid.get(), room.get(), cin.get(), cout.get())
            )
            db.commit()
            messagebox.showinfo("Success", "Reservation Done!")
        except:
            messagebox.showerror("Error", "Check IDs or Data!")

    tk.Button(win, text="Reserve", bg="blue", fg="white", command=reserve).pack(pady=10)


# -------- CHECK-IN --------
def checkin_window():
    win = tk.Toplevel(root)
    win.title("Check-In")
    win.geometry("300x250")

    tk.Label(win, text="Checkin ID").pack()
    cid = tk.Entry(win); cid.pack()

    tk.Label(win, text="Reservation ID").pack()
    rid = tk.Entry(win); rid.pack()

    tk.Label(win, text="Guest ID").pack()
    gid = tk.Entry(win); gid.pack()

    tk.Label(win, text="Room ID").pack()
    room = tk.Entry(win); room.pack()

    def checkin():
        try:
            cursor.execute(
                "INSERT INTO Checkin VALUES(%s,%s,CURDATE(),%s,%s)",
                (cid.get(), rid.get(), gid.get(), room.get())
            )
            cursor.execute("UPDATE Room SET room_status='Occupied' WHERE room_id=%s", (room.get(),))
            db.commit()
            messagebox.showinfo("Success", "Checked In!")
        except:
            messagebox.showerror("Error", "Invalid Data!")

    tk.Button(win, text="Check-In", bg="green", fg="white", command=checkin).pack(pady=10)


# -------- CHECK-OUT --------
def checkout_window():
    win = tk.Toplevel(root)
    win.title("Check-Out")
    win.geometry("300x250")

    tk.Label(win, text="Checkout ID").pack()
    coid = tk.Entry(win); coid.pack()

    tk.Label(win, text="Checkin ID").pack()
    cid = tk.Entry(win); cid.pack()

    tk.Label(win, text="Total Days").pack()
    days = tk.Entry(win); days.pack()

    tk.Label(win, text="Room ID").pack()
    room = tk.Entry(win); room.pack()

    def checkout():
        try:
            cursor.execute(
                "INSERT INTO Checkout VALUES(%s,%s,CURDATE(),%s)",
                (coid.get(), cid.get(), days.get())
            )
            cursor.execute("UPDATE Room SET room_status='Available' WHERE room_id=%s", (room.get(),))
            db.commit()
            messagebox.showinfo("Success", "Checked Out!")
        except:
            messagebox.showerror("Error", "Invalid Data!")

    tk.Button(win, text="Check-Out", bg="orange", fg="white", command=checkout).pack(pady=10)


# -------- GENERATE BILL --------
def bill_window():
    win = tk.Toplevel(root)
    win.title("Generate Bill")
    win.geometry("300x300")

    tk.Label(win, text="Bill ID").pack()
    bid = tk.Entry(win); bid.pack()

    tk.Label(win, text="Checkout ID").pack()
    coid = tk.Entry(win); coid.pack()

    tk.Label(win, text="Room Charges").pack()
    roomc = tk.Entry(win); roomc.pack()

    tk.Label(win, text="Service Charges").pack()
    servc = tk.Entry(win); servc.pack()

    def generate():
        try:
            total = float(roomc.get()) + float(servc.get())
            cursor.execute(
                "INSERT INTO Bill VALUES(%s,%s,%s,%s,%s,'Paid')",
                (bid.get(), coid.get(), roomc.get(), servc.get(), total)
            )
            db.commit()
            messagebox.showinfo("Bill", f"Total Amount = {total}")
        except:
            messagebox.showerror("Error", "Invalid Data!")

    tk.Button(win, text="Generate Bill", bg="purple", fg="white", command=generate).pack(pady=10)

#search 
def search_guest():
    win = tk.Toplevel(root)
    win.title("Search Guest")
    win.geometry("400x300")

    tk.Label(win, text="Enter Guest ID").pack()
    gid = tk.Entry(win)
    gid.pack()

    tree = ttk.Treeview(win, columns=("ID","Name","Phone"), show='headings')
    tree.heading("ID", text="ID")
    tree.heading("Name", text="Name")
    tree.heading("Phone", text="Phone")
    tree.pack(fill="both", expand=True)

    def search():
        tree.delete(*tree.get_children())
        cursor.execute("SELECT * FROM Guest WHERE guest_id=%s", (gid.get(),))
        for row in cursor.fetchall():
            tree.insert("", tk.END, values=row)

    tk.Button(win, text="Search", command=search).pack()

# search room
def search_room():
    win = tk.Toplevel(root)
    win.title("Search Room")
    win.geometry("400x300")

    tk.Label(win, text="Enter Room ID").pack()
    rid = tk.Entry(win)
    rid.pack()

    tree = ttk.Treeview(win, columns=("Room","Type","Status"), show='headings')
    tree.heading("Room", text="Room")
    tree.heading("Type", text="Type")
    tree.heading("Status", text="Status")
    tree.pack(fill="both", expand=True)

    def search():
        tree.delete(*tree.get_children())
        cursor.execute("SELECT room_id, room_type, room_status FROM Room WHERE room_id=%s", (rid.get(),))
        for row in cursor.fetchall():
            tree.insert("", tk.END, values=row)

    tk.Button(win, text="Search", command=search).pack()

#view bills
def view_bills():
    win = tk.Toplevel(root)
    win.title("All Bills")
    win.geometry("600x300")

    tree = ttk.Treeview(win, columns=("BillID","Total"), show='headings')
    tree.heading("BillID", text="Bill ID")
    tree.heading("Total", text="Total Amount")
    tree.pack(fill="both", expand=True)

    cursor.execute("SELECT bill_id,total_amount FROM Bill")
    for row in cursor.fetchall():
        tree.insert("", tk.END, values=row)

#revenue report
def revenue_report():
    win = tk.Toplevel(root)
    win.title("Revenue Report")
    win.geometry("300x200")

    cursor.execute("SELECT SUM(total_amount) FROM Bill")
    total = cursor.fetchone()[0]

    tk.Label(win, text=f"Total Revenue = {total}", font=("Arial", 14)).pack(pady=50)
# ---------------- MAIN WINDOW ----------------

root = tk.Tk()
root.title("Hotel Management System")
root.geometry("800x500")
root.configure(bg="#2c3e50")

tk.Label(root, text="HOTEL MANAGEMENT SYSTEM",
         font=("Arial", 20, "bold"),
         bg="#2c3e50", fg="white").pack(pady=20)

frame = tk.Frame(root, bg="#34495e")
frame.pack(pady=20)

btn_style = {
    "font": ("Segoe UI", 12, "bold"),
    "width": 22,
    "bg": "#3498db",
    "fg": "white",
    "bd": 0
}

tk.Button(frame, text="Add Guest", **btn_style, command=add_guest_window).grid(row=0, column=0, padx=10, pady=10)
tk.Button(frame, text="View Rooms", **btn_style, command=view_rooms).grid(row=0, column=1, padx=10, pady=10)
tk.Button(frame, text="Make Reservation", **btn_style, command=reservation_window).grid(row=1, column=0, padx=10, pady=10)
tk.Button(frame, text="Check-In", **btn_style, command=checkin_window).grid(row=1, column=1, padx=10, pady=10)
tk.Button(frame, text="Check-Out", **btn_style, command=checkout_window).grid(row=2, column=0, padx=10, pady=10)
tk.Button(frame, text="Generate Bill", **btn_style, command=bill_window).grid(row=2, column=1, padx=10, pady=10)
tk.Button(frame, text="Search Guest", **btn_style, command=search_guest).grid(row=3, column=0, padx=10, pady=10)
tk.Button(frame, text="Search Room", **btn_style, command=search_room).grid(row=3, column=1, padx=10, pady=10)
tk.Button(frame, text="View Bills", **btn_style, command=view_bills).grid(row=4, column=0, padx=10, pady=10)
tk.Button(frame, text="Revenue Report", **btn_style, command=revenue_report).grid(row=4, column=1, padx=10, pady=10)

root.mainloop()